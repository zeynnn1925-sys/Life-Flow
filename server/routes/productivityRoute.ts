import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const productivityRouter = Router();

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
          'User-Agent': 'aistudio-build-productivity',
        }
      }
    });
  }
  return geminiClient;
}

const Type = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  INTEGER: 'INTEGER',
  BOOLEAN: 'BOOLEAN',
  ARRAY: 'ARRAY',
  OBJECT: 'OBJECT',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

async function handleProductivityPlan(req: Request, res: Response) {
  const { date, language } = req.body || {};
  const isId = language === 'id';
  
  try {
    const langPrompt = isId ? 'in Indonesian' : 'in English';
    const planPrompt = `Create a highly productive, realistic daily schedule for ${date || new Date().toISOString().split('T')[0]} ${langPrompt}. 
    For each activity, specify:
    1. The title of the activity.
    2. Start and end times (HH:MM format).
    3. A specific practical 'challenge' to make it engaging.
    4. The specific field of study or work (e.g., 'React Development', 'Digital Marketing', 'Data Science', 'Financial Health').
    5. A list of tools needed for this field (e.g., ['VS Code', 'React Docs', 'Figma']).
    6. A target percentage of completion or a specific target metric (e.g., 20, 50, 100).
    Return strictly a JSON array with 4-5 items.`;

    const planConfig = {
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
    };

    const ai = getGeminiClient();
    const primary = 'gemini-3.6-flash';
    const fallback = 'gemini-3.1-flash-lite';

    let result = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        result = await ai.models.generateContent({
          model: primary,
          contents: planPrompt,
          config: planConfig,
        });
        break;
      } catch (err: any) {
        if (attempt < 2) {
          await delay(400);
          continue;
        }
        console.warn(`[ProductivityPlan] Primary model ${primary} failed, trying ${fallback}:`, err?.message);
        break;
      }
    }

    if (!result) {
      result = await ai.models.generateContent({
        model: fallback,
        contents: planPrompt,
        config: planConfig,
      });
    }

    return res.json({ text: result.text });
  } catch (error: any) {
    console.error('Gemini productivity-plan error (gracefully falling back):', error?.message || error);
    const fallbackList = getFallbackPlan(isId);
    return res.json({ text: JSON.stringify(fallbackList) });
  }
}

// Support both direct route when mounted as router, and explicit sub-paths
productivityRouter.post('/', handleProductivityPlan);
productivityRouter.post('/productivity-plan', handleProductivityPlan);
productivityRouter.post('/api/gemini/productivity-plan', handleProductivityPlan);
productivityRouter.post('/api/productivity-plan', handleProductivityPlan);
