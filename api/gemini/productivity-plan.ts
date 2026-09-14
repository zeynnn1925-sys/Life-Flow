import { GoogleGenAI } from '@google/genai';

let geminiClient: any = null;
function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-productivity-vercel',
        }
      }
    });
  }
  return geminiClient;
}

const getFallbackPlan = (isId: boolean) => [
  {
    title: isId ? "Review & Perencanaan Pagi" : "Morning Planning & Review",
    startTime: "08:00",
    endTime: "09:00",
    challenge: isId ? "Tulis 3 prioritas utama hari ini tanpa gangguan ponsel." : "List 3 top priorities today without phone distractions.",
    fieldToStudy: isId ? "Manajemen Waktu" : "Time Management",
    toolsNeeded: ["LifeFlow Planner", "Notes"],
    targetPercentage: 100
  },
  {
    title: isId ? "Sesi Kerja / Belajar Utama (Deep Work)" : "Deep Work Sprint",
    startTime: "09:30",
    endTime: "12:00",
    challenge: isId ? "Gunakan teknik Pomodoro: 25 menit fokus penuh, 5 menit istirahat." : "Use Pomodoro technique: 25 min deep focus, 5 min break.",
    fieldToStudy: isId ? "Keahlian Profesional" : "Professional Skills",
    toolsNeeded: ["Focus Chamber", "VS Code / Workspace"],
    targetPercentage: 100
  },
  {
    title: isId ? "Evaluasi Arus Kas & Target Finansial" : "Cash Flow & Budget Check",
    startTime: "13:30",
    endTime: "14:15",
    challenge: isId ? "Catat semua transaksi masuk & keluar pagi ini ke LifeFlow." : "Record all morning expenses and income into LifeFlow.",
    fieldToStudy: isId ? "Literasi Finansial" : "Financial Literacy",
    toolsNeeded: ["LifeFlow Finance Tracker"],
    targetPercentage: 100
  },
  {
    title: isId ? "Aktivitas Fisik & Kebiasaan Sehat" : "Physical Exercise & Habits",
    startTime: "16:30",
    endTime: "17:30",
    challenge: isId ? "Penuhi target air minum harian dan lakukan peregangan 15 menit." : "Hit daily hydration target and do a 15-min stretch.",
    fieldToStudy: isId ? "Kebugaran Fisik" : "Physical Health",
    toolsNeeded: ["LifeFlow Habit Tracker", "Water Bottle"],
    targetPercentage: 100
  },
  {
    title: isId ? "Refleksi Malam & Evaluasi Target" : "Evening Reflection & Wrap-up",
    startTime: "20:30",
    endTime: "21:00",
    challenge: isId ? "Tulis 1 hal yang kamu syukuri hari ini di jurnal." : "Write 1 thing you are grateful for today in your journal.",
    fieldToStudy: isId ? "Refleksi Diri" : "Self Reflection",
    toolsNeeded: ["LifeFlow Journal"],
    targetPercentage: 100
  }
];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date, language } = req.body || {};
  const isId = language === 'id';

  try {
    const ai = getGeminiClient();
    const langPrompt = isId ? 'in Indonesian' : 'in English';
    const planPrompt = `Create a highly productive daily schedule for ${date || new Date().toISOString().split('T')[0]} ${langPrompt}. 
    Return strictly a JSON array of 4-5 items with keys: title, startTime, endTime, challenge, fieldToStudy, toolsNeeded (string array), targetPercentage (number).`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: planPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return res.status(200).json({ text: result.text });
  } catch (err: any) {
    console.error('Vercel serverless productivity-plan error:', err?.message || err);
    return res.status(200).json({ text: JSON.stringify(getFallbackPlan(isId)) });
  }
}
