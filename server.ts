import express from 'express';
import { createServer as createViteServer } from 'vite';
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
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
      // Import dynamically to avoid loading latency if not used
      const { GoogleGenAI } = require('@google/genai');
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
    try {
      const { language } = req.body;
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
      console.error('Gemini generate-insight error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate insight' });
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
      console.error('Gemini habit-coach error:', error);
      res.status(500).json({ error: error.message || 'Failed to connect with Coach' });
    }
  });

  app.post('/api/gemini/finance-advisor', async (req, res) => {
    try {
      const { totalIncome, totalExpense, allocation, expensesByCategory, language } = req.body;
      const targetNeeds = totalIncome * 0.5;
      const targetWants = totalIncome * 0.3;
      const targetSavings = totalIncome * 0.2;

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
      console.error('Gemini finance-advisor error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate financial advice' });
    }
  });

  app.post('/api/gemini/scan-receipt', async (req, res) => {
    try {
      const { base64Image, mimeType } = req.body;
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: "Analyze this receipt and extract the following information. Return ONLY a valid JSON object with no markdown formatting or backticks. If you cannot find a value, leave it empty or 0. The JSON should have these keys: 'description' (string, the main store or item name), 'amount' (number, the total amount paid), 'date' (string, YYYY-MM-DD format), 'notes' (string, any extra details or items).",
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              date: { type: Type.STRING },
              notes: { type: Type.STRING },
            },
            required: ["description", "amount", "date"],
          },
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini scan-receipt error:', error);
      res.status(500).json({ error: error.message || 'Failed to scan receipt' });
    }
  });

  app.post('/api/gemini/productivity-plan', async (req, res) => {
    try {
      const { date, language } = req.body;
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
      console.error('Gemini productivity-plan error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate productivity plan' });
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
