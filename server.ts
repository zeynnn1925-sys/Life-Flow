import express from 'express';
import { createServer as createViteServer } from 'vite';
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

// Lazy initialization of Firebase Admin
let adminApp: admin.app.App | null = null;

function getFirebaseAdmin() {
  if (!adminApp) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK will not be initialized.');
      return null;
    }
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      return null;
    }
  }
  return adminApp;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware
  const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const firebaseAdmin = getFirebaseAdmin();
    
    if (!firebaseAdmin) {
      // In development, if Firebase key is missing, we might want to bypass or show clear error
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Firebase Admin not initialized, skipping authentication check');
        (req as any).user = { uid: 'dev-user', email: 'dev@example.com' };
        return next();
      }
      return res.status(500).json({ error: 'Server authentication service unavailable' });
    }

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying auth token:', error);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', adminInitialized: !!getFirebaseAdmin() });
  });

  // Client-safe Gemini API endpoints
  let geminiClient: any = null;
  const getGeminiClient = () => {
    if (!geminiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }
      geminiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return geminiClient;
  };

  // Helper enum-like object mirroring @google/genai Type in CJS compile
  const Type = {
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',
    ARRAY: 'ARRAY',
    OBJECT: 'OBJECT',
  };

  app.post('/api/gemini/generate-insight', async (req, res) => {
    const { language } = req.body;
    try {
      const prompt = language === 'id'
        ? "Berikan 1 kalimat motivasi produktivitas harian yang sangat singkat, elegan, praktis, berkaitan dengan pengelolaan saldo finansial, tugas hiasan (dekorasi kegiatan), dan kebiasaan."
        : "Provide 1 short, elegant, and highly practical peak performance productivity advice regarding matching daily routines, habits (consistent efforts), and financial peace.";
      
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini generate-insight error (falling back):', error);
      const fallbackId = [
        "Fokus pada kemajuan hari ini, sekecil apapun itu. Alur kerja yang konsisten mengalahkan lonjakan motivasi yang sesaat.",
        "Kelola energi Anda dengan bijak, bukan hanya waktu Anda. Mulailah hari dengan prioritas keuangan dan tugas yang paling berdampak.",
        "Setiap kebiasaan kecil yang kita bangun hari ini adalah investasi berharga untuk masa depan keuangan dan kesejahteraan kita."
      ];
      const fallbackEn = [
        "Focus on today's progress, no matter how small. A consistent workflow beats a short burst of motivation.",
        "Manage your energy, not just your time. Start your day with high-impact financial and personal goals.",
        "Every small habit you build today is a valuable investment in your future financial freedom and wellbeing."
      ];
      const list = language === 'id' ? fallbackId : fallbackEn;
      const randomInsight = list[Math.floor(Math.random() * list.length)];
      res.json({ text: randomInsight });
    }
  });

  app.post('/api/gemini/generate-insight-stream', async (req, res) => {
    try {
      const { language, context } = req.body;
      
      let systemInstruction = '';
      let userPrompt = '';
      
      if (language === 'id') {
        systemInstruction = "Anda adalah asisten keuangan pribadi AI yang cerdas, tajam, dan sangat membantu. Analisis data keuangan pengguna dan berikan 1 kalimat insight yang sangat praktis, langsung dapat diterapkan (actionable), dan spesifik terhadap data mereka. Fokus pada apa yang harus mereka lakukan untuk menyeimbangkan anggaran atau mencapai target.";
        userPrompt = `
Berikut adalah data finansial saya saat ini:
- Saldo saat ini: Rp ${(context?.balance ?? 0).toLocaleString('id-ID')}
- Total Pemasukan Bulan Ini: Rp ${(context?.thisMonthIncome ?? 0).toLocaleString('id-ID')}
- Total Pengeluaran Bulan Ini: Rp ${(context?.thisMonthExpense ?? 0).toLocaleString('id-ID')}
- Kategori Pengeluaran Terbesar: ${context?.topExpenseCategory ? `${context.topExpenseCategory.category} (Rp ${context.topExpenseCategory.amount.toLocaleString('id-ID')})` : 'Tidak ada pengeluaran'}
- Target Finansial aktif: ${context?.targets && context.targets.length > 0 ? context.targets.map((t: any) => `${t.title} (${Math.round(t.current / t.target * 100)}% tercapai)`).join(', ') : 'Tidak ada target aktif'}

Berikan 1 kalimat analisis/insight finansial yang super tajam dan taktis berdasarkan data di atas. Jangan berikan kata sambutan, basa-basi, atau tanda kutip di awal dan di akhir.
`;
      } else {
        systemInstruction = "You are an intelligent, sharp, and highly supportive AI financial personal advisor. Analyze the user's financial data and provide 1 extremely practical, actionable, and specific insight based on their data. Focus on what they should do to optimize budgets or reach targets.";
        userPrompt = `
Here is my current financial data:
- Current Balance: Rp ${(context?.balance ?? 0).toLocaleString('en-US')}
- Total Income This Month: Rp ${(context?.thisMonthIncome ?? 0).toLocaleString('en-US')}
- Total Expense This Month: Rp ${(context?.thisMonthExpense ?? 0).toLocaleString('en-US')}
- Highest Expense Category: ${context?.topExpenseCategory ? `${context.topExpenseCategory.category} (Rp ${context.topExpenseCategory.amount.toLocaleString('en-US')})` : 'None'}
- Running Targets Progress: ${context?.targets && context.targets.length > 0 ? context.targets.map((t: any) => `${t.title} (${Math.round(t.current / t.target * 100)}% achieved)`).join(', ') : 'No active targets'}

Provide 1 short, actionable, and extremely sharp financial advice based on the data above. Do not use intro text, friendly greetings, or quotes around the response.
`;
      }

      const ai = getGeminiClient();
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          maxOutputTokens: 150,
          temperature: 0.7,
        }
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      res.end();
    } catch (error: any) {
      console.error('Gemini generate-insight-stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Failed to stream insight' });
      } else {
        res.write(' [Error streaming response]');
        res.end();
      }
    }
  });

  app.post('/api/gemini/habit-coach', async (req, res) => {
    try {
      const { habits } = req.body;
      const habitData = (habits || []).map((h: any) => `${h.title} (Streak: ${h.currentStreak}, Completions: ${h.totalCompletions})`).join(', ');
      const prompt = `You are the LifeFlow AI Habit Coach. Based on these habits: ${habitData}, 
      give me ONE specific, actionable, and motivating tip to improve consistency today. 
      Keep it under 150 characters. Be supportive but professional. Use Indonesian language (Bahasa Indonesia).`;
      
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini habit-coach error (falling back):', error);
      const fallbacks = [
        "Mulai dari yang kecil, misalnya 5 menit sehari. Kunci utama adalah konsistensi, bukan intensitas tinggi.",
        "Coba teknik 'habit stacking': kaitkan kebiasaan baru ini tepat setelah kebiasaan lama yang rutin Anda lakukan.",
        "Jangan lewatkan kebiasaan dua kali berturut-turut. Jika hari ini terlewat, pastikan besok kembali berkomitmen.",
        "Rayakan setiap pencapaian kecil untuk melatih otak mengaitkan kebiasaan ini dengan emosi positif."
      ];
      const randomAdvice = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      res.json({ text: randomAdvice });
    }
  });

  app.post('/api/gemini/finance-advisor', async (req, res) => {
    const { totalIncome, totalExpense, allocation, expensesByCategory, language } = req.body;
    const targetNeeds = (totalIncome || 0) * 0.5;
    const targetWants = (totalIncome || 0) * 0.3;
    const targetSavings = (totalIncome || 0) * 0.2;
    try {
      const prompt = `
        You are an expert financial advisor. The user wants to strictly follow the 50/30/20 budgeting rule (50% Needs, 30% Wants, 20% Savings).
        Please analyze their current finances and provide specific, actionable advice on how to adjust their spending to hit these targets exactly.
        
        Current Financial Data:
        - Total Income: Rp ${(totalIncome || 0).toLocaleString()}
        - Total Expenses: Rp ${(totalExpense || 0).toLocaleString()}
        
        Current Allocation:
        - Needs: Rp ${(allocation?.needs || 0).toLocaleString()} (Target: Rp ${targetNeeds.toLocaleString()})
        - Wants: Rp ${(allocation?.wants || 0).toLocaleString()} (Target: Rp ${targetWants.toLocaleString()})
        - Savings: Rp ${(allocation?.savings || 0).toLocaleString()} (Target: Rp ${targetSavings.toLocaleString()})
        
        Expenses by Category:
        ${Object.entries(expensesByCategory || {}).map(([cat, amount]) => `- ${cat}: Rp ${(amount as number).toLocaleString()}`).join('\n')}
        
        Please provide your advice in ${language === 'id' ? 'Indonesian' : 'English'}. Keep it concise, practical, and formatted with bullet points or short paragraphs. Focus on exactly what they need to cut or increase to hit the 50/30/20 targets perfectly.
      `;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini finance-advisor error (falling back):', error);
      const adviceId = `Saran Anggaran 50/30/20:
- **Kebutuhan (Needs)**: Alokasi Anda Rp ${(allocation?.needs || 0).toLocaleString()} (Target: Rp ${targetNeeds.toLocaleString()}).
- **Keinginan (Wants)**: Alokasi Anda Rp ${(allocation?.wants || 0).toLocaleString()} (Target: Rp ${targetWants.toLocaleString()}).
- **Tabungan (Savings)**: Alokasi Anda Rp ${(allocation?.savings || 0).toLocaleString()} (Target: Rp ${targetSavings.toLocaleString()}).

**Saran Praktis**:
1. Jika pengeluaran Kebutuhan/Keinginan melebihi batas, cobalah memangkas pengeluaran non-esensial (seperti makan di luar atau langganan bulanan).
2. Prioritaskan menyisihkan 20% pendapatan langsung di awal bulan ke rekening tabungan/investasi sebelum membelanjakan sisanya.
3. Selalu pantau pengeluaran harian agar tidak melampaui rencana anggaran bulanan Anda.`;

      const adviceEn = `50/30/20 Budgeting Advice:
- **Needs**: Your allocation is Rp ${(allocation?.needs || 0).toLocaleString()} (Target: Rp ${targetNeeds.toLocaleString()}).
- **Wants**: Your allocation is Rp ${(allocation?.wants || 0).toLocaleString()} (Target: Rp ${targetWants.toLocaleString()}).
- **Savings**: Your allocation is Rp ${(allocation?.savings || 0).toLocaleString()} (Target: Rp ${targetSavings.toLocaleString()}).

**Actionable Advice**:
1. If your Needs or Wants exceed target limits, try cutting back on discretionary spending (like dining out or entertainment subscriptions).
2. Automate a transfer of 20% of your income to savings/investment immediately at the start of the month.
3. Monitor category-wise limits weekly to stay on track.`;

      res.json({ text: language === 'id' ? adviceId : adviceEn });
    }
  });

  app.post('/api/gemini/scan-receipt', async (req, res) => {
    try {
      const { base64Image, mimeType, categories } = req.body;
      const ai = getGeminiClient();
      
      let systemPrompt = "You are an expert financial receipt scanner. Extract store name (description), total amount, date, and items. ";
      if (categories && Array.isArray(categories) && categories.length > 0) {
        systemPrompt += "Match the receipt with the best fitting category ID from this list: " + JSON.stringify(categories) + ". Return the matched category's ID in the 'categoryId' field. Choose carefully based on the items or store name.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType || "image/jpeg",
              },
            },
            {
              text: "Analyze this receipt image and extract: store name as 'description', total amount as 'amount', date as 'date' (YYYY-MM-DD format), items or details as 'notes' (and append receipt date here if found), and best-matching category ID as 'categoryId'. Return as JSON.",
            },
          ],
        },
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              date: { type: Type.STRING },
              notes: { type: Type.STRING },
              categoryId: { type: Type.STRING },
            },
            required: ["description", "amount", "date"],
          },
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini scan-receipt error (falling back):', error);
      const fallbackJson = {
        description: "Struk Belanja / Receipt",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: "Maaf, pemindaian otomatis sedang sibuk. Silakan masukkan detail secara manual.",
        categoryId: ""
      };
      res.json({ text: JSON.stringify(fallbackJson) });
    }
  });

  app.post('/api/gemini/productivity-plan', async (req, res) => {
    const { date, language } = req.body;
    try {
      const langPrompt = language === 'id' ? 'in Indonesian' : 'in English';
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create a highly productive and realistic daily schedule for ${date} ${langPrompt}. 
        For each activity, specify:
        1. The title of the activity.
        2. Start and end times.
        3. A specific 'challenge' to make it engaging.
        4. The specific field of study or work (e.g., 'React Development', 'Digital Marketing', 'Data Science').
        5. A list of tools needed for this field (e.g., ['VS Code', 'React Docs', 'Figma']).
        6. A target percentage of completion or a specific target metric (e.g., 20, 50, 100).
        Return it in JSON format.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                challenge: { type: Type.STRING },
                fieldToStudy: { type: Type.STRING },
                toolsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
                targetPercentage: { type: Type.NUMBER }
              },
              required: ["title", "startTime", "endTime", "challenge", "fieldToStudy", "toolsNeeded", "targetPercentage"]
            }
          }
        }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini productivity-plan error (falling back):', error);
      const defaultPlanId = [
        {
          title: "Review & Perencanaan Pagi",
          startTime: "08:00",
          endTime: "09:00",
          challenge: "Tulis 3 prioritas utama hari ini tanpa gangguan ponsel.",
          fieldToStudy: "Manajemen Waktu",
          toolsNeeded: ["LifeFlow Planner", "Buku Catatan"],
          targetPercentage: 100
        },
        {
          title: "Sesi Belajar / Kerja Utama",
          startTime: "09:30",
          endTime: "12:00",
          challenge: "Gunakan teknik Pomodoro: 25 menit fokus penuh, 5 menit istirahat.",
          fieldToStudy: "Keahlian Profesional",
          toolsNeeded: ["Laptop", "Koneksi Internet"],
          targetPercentage: 80
        },
        {
          title: "Evaluasi Finansial & Habit",
          startTime: "16:00",
          endTime: "17:00",
          challenge: "Catat semua pengeluaran hari ini dan centang kebiasaan yang selesai.",
          fieldToStudy: "Literasi Finansial",
          toolsNeeded: ["LifeFlow Dashboard"],
          targetPercentage: 90
        }
      ];

      const defaultPlanEn = [
        {
          title: "Morning Review & Planning",
          startTime: "08:00",
          endTime: "09:00",
          challenge: "Write down 3 main priorities today without phone distractions.",
          fieldToStudy: "Time Management",
          toolsNeeded: ["LifeFlow Planner", "Notebook"],
          targetPercentage: 100
        },
        {
          title: "Core Work / Study Session",
          startTime: "09:30",
          endTime: "12:00",
          challenge: "Apply Pomodoro technique: 25 minutes absolute focus, 5 minutes break.",
          fieldToStudy: "Professional Skills",
          toolsNeeded: ["Laptop", "Internet Access"],
          targetPercentage: 80
        },
        {
          title: "Financial & Habit Reflection",
          startTime: "16:00",
          endTime: "17:00",
          challenge: "Log all of today's transactions and tick your completed habits.",
          fieldToStudy: "Financial Literacy",
          toolsNeeded: ["LifeFlow Dashboard"],
          targetPercentage: 90
        }
      ];

      const chosenPlan = language === 'id' ? defaultPlanId : defaultPlanEn;
      res.json({ text: JSON.stringify(chosenPlan) });
    }
  });

  app.post('/api/gemini/generate-challenges', async (req, res) => {
    const { language } = req.body;
    try {
      const isIndo = language === 'id';
      const prompt = `Generate a list of exactly 3 highly motivating and actionable daily/weekly challenges/targets for productivity, health, finance, or personal development that the user should try or perform today. Provide standard title, description, category, targetValue, and unit for each. Language of titles, descriptions and units must be strictly in ${isIndo ? 'Indonesian' : 'English'}. The category MUST be exactly one of: 'health', 'work', 'personal', or 'finance'.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                targetValue: { type: Type.NUMBER },
                unit: { type: Type.STRING }
              },
              required: ["title", "description", "category", "targetValue", "unit"]
            }
          }
        }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini generate-challenges error (falling back):', error);
      const fallbackId = [
        {
          title: "Minum Air Hidrasi",
          description: "Minum 2 liter air putih hari ini untuk menjaga metabolisme tubuh dan fokus berpikir.",
          category: "health",
          targetValue: 2,
          unit: "Liter"
        },
        {
          title: "Membaca Buku",
          description: "Membaca minimal 10 halaman buku pengembangan diri atau pengetahuan hari ini.",
          category: "personal",
          targetValue: 10,
          unit: "Halaman"
        },
        {
          title: "Catat Pengeluaran",
          description: "Disiplin mencatat minimal 1 pengeluaran atau tabungan hari ini di LifeFlow.",
          category: "finance",
          targetValue: 1,
          unit: "Kali"
        }
      ];
      const fallbackEn = [
        {
          title: "Hydration Intake",
          description: "Drink 2 liters of water today to keep your energy high and mind clear.",
          category: "health",
          targetValue: 2,
          unit: "Liters"
        },
        {
          title: "Knowledge Boost",
          description: "Read at least 10 pages of any self-improvement or educational book.",
          category: "personal",
          targetValue: 10,
          unit: "Pages"
        },
        {
          title: "Financial Logging",
          description: "Log at least 1 expense or saving item in LifeFlow to stay mindful.",
          category: "finance",
          targetValue: 1,
          unit: "Times"
        }
      ];
      const chosenFallback = language === 'id' ? fallbackId : fallbackEn;
      res.json({ text: JSON.stringify(chosenFallback) });
    }
  });

  app.post('/api/gemini/classify-jobs', async (req, res) => {
    const { language, links } = req.body;
    try {
      const ai = getGeminiClient();
      const isIndo = language === 'id';
      
      const prompt = `
        You are an expert career advisor and industrial classification system.
        Analyze this array of Indonesian companies/portals with job listing links:
        ${JSON.stringify(links)}
        
        Classify each item into a refined sector, write a short, appealing career outlook/prospect note, and suggest a specific action goal with a target value (usually 1) and unit (e.g., 'Lamaran', 'Profile Setup', 'Apply', 'Check').
        Provide the response as a JSON array matching the exact order of the inputs.
        Each item in the array MUST contain:
        - "id": string (the exact ID of the input)
        - "refinedSector": string (refined sector name in ${isIndo ? 'Indonesian' : 'English'})
        - "careerProspect": string (1 brief professional sentence in ${isIndo ? 'Indonesian' : 'English'})
        - "recommendedGoal": string (actionable goal title in ${isIndo ? 'Indonesian' : 'English'})
        - "targetValue": number (typically 1)
        - "unit": string (e.g. "Lamaran", "Pengecekan", "Application" in ${isIndo ? 'Indonesian' : 'English'})
        
        Return ONLY valid JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                refinedSector: { type: Type.STRING },
                careerProspect: { type: Type.STRING },
                recommendedGoal: { type: Type.STRING },
                targetValue: { type: Type.NUMBER },
                unit: { type: Type.STRING }
              },
              required: ["id", "refinedSector", "careerProspect", "recommendedGoal", "targetValue", "unit"]
            }
          }
        }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini classify-jobs error, running dynamic keyword-based fallback:', error);
      
      // Smart Keyword fallback
      const isIndo = language === 'id';
      const fallbackList = (links || []).map((lnk: any) => {
        let refinedSector = isIndo ? "Sektor Industri Umum" : "General Industrial Sector";
        let careerProspect = isIndo 
          ? "Peluang karir yang solid dengan jenjang karir terstruktur di perusahaan terkemuka." 
          : "Solid career prospects with structured professional growth in a leading organization.";
        let recommendedGoal = isIndo ? "Kirim Lamaran & CV" : "Submit Application & CV";
        let unit = isIndo ? "Lamaran" : "Application";

        const nameLower = (lnk.name || "").toLowerCase();
        
        if (nameLower.includes("kai") || nameLower.includes("commuter") || nameLower.includes("services") || nameLower.includes("wisata") || nameLower.includes("bandara")) {
          refinedSector = isIndo ? "Perkeretaapian & Transportasi Publik" : "Railways & Public Transport";
          careerProspect = isIndo
            ? "Bekerja di BUMN perkeretaapian menawarkan stabilitas kerja tinggi dan tunjangan komprehensif."
            : "Working in state-owned rail group offers premium job security and robust allowances.";
          recommendedGoal = isIndo ? `Daftar Rekrutmen Bersama ${lnk.name}` : `Apply for ${lnk.name} Recruitments`;
        } else if (nameLower.includes("coffee") || nameLower.includes("kfc") || nameLower.includes("gacoan") || nameLower.includes("roti") || nameLower.includes("burger") || nameLower.includes("hokben") || nameLower.includes("richeese")) {
          refinedSector = isIndo ? "Kuliner & Layanan Makanan (F&B)" : "Culinary & Food Services (F&B)";
          careerProspect = isIndo
            ? "Industri F&B yang tumbuh pesat dengan kesempatan belajar operasional bisnis ritel makanan yang kuat."
            : "Fast-growing food industry with hands-on exposure to scaled retail food operations.";
          recommendedGoal = isIndo ? `Daftar Staff / Crew di ${lnk.name}` : `Apply for Crew/Staff at ${lnk.name}`;
        } else if (nameLower.includes("toyota") || nameLower.includes("honda") || nameLower.includes("yamaha") || nameLower.includes("daihatsu") || nameLower.includes("bridgestone") || nameLower.includes("otoparts")) {
          refinedSector = isIndo ? "Otomotif & Manufaktur Presisi" : "Automotive & Precision Manufacturing";
          careerProspect = isIndo
            ? "Pusat teknologi otomotif global dengan kompensasi di atas rata-rata industri nasional."
            : "Hub of global automotive technology with highly competitive industrial compensation.";
          recommendedGoal = isIndo ? `Daftar Engineering/Operator di ${lnk.name}` : `Apply for Engineer/Operator at ${lnk.name}`;
        } else if (nameLower.includes("unilever") || nameLower.includes("wings") || nameLower.includes("kalbe") || nameLower.includes("kao") || nameLower.includes("garudafood")) {
          refinedSector = isIndo ? "FMCG & Farmasi Konsumen" : "FMCG & Consumer Healthcare";
          careerProspect = isIndo
            ? "Perusahaan barang konsumsi sehari-hari dengan program Management Trainee kelas dunia."
            : "Fast-moving consumer goods giant with world-class management training frameworks.";
          recommendedGoal = isIndo ? `Lamar Lowongan MT/Staff ${lnk.name}` : `Submit MT/Staff application to ${lnk.name}`;
        } else if (nameLower.includes("mandiri")) {
          refinedSector = isIndo ? "Perbankan & Keuangan Negara" : "Banking & State-Owned Finance";
          careerProspect = isIndo
            ? "Bergabung dengan salah satu bank terbesar di Indonesia untuk membangun portofolio finansial profesional."
            : "Join one of the largest banks in Indonesia to forge an outstanding financial portfolio.";
          recommendedGoal = isIndo ? "Lamar Officer Development Program (ODP)" : "Apply for Officer Development Program (ODP)";
          unit = isIndo ? "Aplikasi" : "Application";
        } else if (nameLower.includes("xl") || nameLower.includes("vidio")) {
          refinedSector = isIndo ? "Telekomunikasi & Media Digital" : "Telecom & Digital Media Services";
          careerProspect = isIndo
            ? "Ekosistem digital modern yang dinamis untuk karir di bidang teknologi dan kreatif."
            : "Dynamic, modern digital ecosystem optimal for technology and creative career tracks.";
          recommendedGoal = isIndo ? "Kirim Portofolio & CV" : "Submit Portfolio & CV";
        }

        return {
          id: lnk.id,
          refinedSector,
          careerProspect,
          recommendedGoal,
          targetValue: 1,
          unit
        };
      });

      res.json({ text: JSON.stringify(fallbackList) });
    }
  });

  // Protected Admin Route: Get total users count from Firestore
  app.get('/api/admin/users/count', authenticate, async (req, res) => {
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      return res.status(500).json({ error: 'Firebase Admin not configured.' });
    }
    try {
      const db = firebaseAdmin.firestore();
      const snapshot = await db.collection('users').count().get();
      res.json({ count: snapshot.data().count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
