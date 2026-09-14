import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getFirebaseAdmin } from '../firebaseAdmin';
import firebaseConfig from '../../firebase-applet-config.json' assert { type: 'json' };

export const advisorRouter = Router();

// Lazy Gemini client helper
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
          'User-Agent': 'aistudio-build-advisor',
        }
      }
    });
  }
  return geminiClient;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callAdvisorGeminiWithFallback(params: {
  contents: any;
  config?: any;
  primaryModel?: string;
  fallbackModel?: string;
}) {
  const ai = getGeminiClient();
  const primary = params.primaryModel || 'gemini-3.8-flash';
  const fallback = params.fallbackModel || 'gemini-3.1-flash-lite';

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await ai.models.generateContent({
        model: primary,
        contents: params.contents,
        config: params.config,
      });
    } catch (err: any) {
      if (attempt < 2) {
        await delay(400);
        continue;
      }
      console.warn(`[Advisor Gemini] Primary ${primary} failed. Switching to ${fallback}. Error:`, err?.message || err);
      break;
    }
  }

  return await ai.models.generateContent({
    model: fallback,
    contents: params.contents,
    config: params.config,
  });
}

/**
 * Server-side verified context builder
 * Queries Firestore server-side using authenticated uid.
 */
async function buildAdvisorContext(uid: string, language: string = 'en') {
  const adminApp = getFirebaseAdmin();
  let transactions: any[] = [];
  let habits: any[] = [];
  let targets: any[] = [];
  let tasks: any[] = [];

  if (adminApp && uid && uid !== 'dev-user' && uid !== 'anonymous-user' && uid !== 'guest-user') {
    try {
      const db = (firebaseConfig as any).firestoreDatabaseId
        ? adminApp.firestore((firebaseConfig as any).firestoreDatabaseId)
        : adminApp.firestore();
      
      // Fetch user records in parallel with limits
      const [txSnap, habitSnap, targetSnap, taskSnap] = await Promise.all([
        db.collection('transactions').where('userId', '==', uid).limit(50).get().catch(() => null),
        db.collection('habits').where('userId', '==', uid).limit(30).get().catch(() => null),
        db.collection('targets').where('userId', '==', uid).limit(20).get().catch(() => null),
        db.collection('tasks').where('userId', '==', uid).limit(30).get().catch(() => null),
      ]);

      if (txSnap && !txSnap.empty) {
        transactions = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      if (habitSnap && !habitSnap.empty) {
        habits = habitSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      if (targetSnap && !targetSnap.empty) {
        targets = targetSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      if (taskSnap && !taskSnap.empty) {
        tasks = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (error) {
      console.error('[Advisor Context] Error fetching Firestore records:', error);
    }
  }

  // Calculate aggregates
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const netBalance = totalIncome - totalExpense;

  // Category breakdown for expenses
  const categoryExpenses: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const cat = t.category || 'Other';
      categoryExpenses[cat] = (categoryExpenses[cat] || 0) + (Number(t.amount) || 0);
    });

  const topCategory = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1])[0];

  return {
    verifiedUid: uid,
    language,
    finance: {
      netBalance,
      totalIncome,
      totalExpense,
      transactionCount: transactions.length,
      topExpenseCategory: topCategory ? { category: topCategory[0], amount: topCategory[1] } : null,
      recentTransactions: transactions.slice(0, 8).map(t => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: t.date,
        description: t.description
      }))
    },
    habits: {
      totalTracked: habits.length,
      activeHabits: habits.map(h => ({
        name: h.name || h.title,
        streak: h.streak || h.currentStreak || 0,
        frequency: h.frequency || 'daily'
      }))
    },
    targets: {
      totalTargets: targets.length,
      list: targets.map(t => ({
        title: t.title,
        current: t.current || t.currentAmount || 0,
        target: t.target || t.targetAmount || 1,
        unit: t.unit || '',
        category: t.category || 'general',
        completionPercent: Math.round(((t.current || t.currentAmount || 0) / (t.target || t.targetAmount || 1)) * 100)
      }))
    },
    tasks: {
      pendingTasks: tasks.filter(tk => !tk.completed).length,
      completedTasks: tasks.filter(tk => tk.completed).length,
    }
  };
}

// Main AI Advisor Chat Endpoint
advisorRouter.post('/chat', async (req: Request, res: Response) => {
  const uid = (req as any).user?.uid || 'anonymous-user';
  const { message, history = [], language = 'en' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Valid message string is required' });
  }

  try {
    // 1. Build context from server-side Firestore
    const context = await buildAdvisorContext(uid, language);

    // 2. Language-specific prompt customization
    const langNames: Record<string, string> = {
      id: 'Bahasa Indonesia',
      en: 'English',
      ar: 'العربية (Arabic)',
      es: 'Español (Spanish)'
    };
    const targetLangName = langNames[language] || 'English';

    const systemInstruction = `You are LifeFlow's Chief Life & Financial Intelligence Advisor. 
You provide hyper-actionable, empathetic, and mathematically accurate coaching on finances, habits, daily targets, and productivity.

CRITICAL DIRECTIVES:
1. STRICT LANGUAGE REQUIREMENT: You MUST respond entirely in ${targetLangName}. 
2. CONTEXT ACCURACY: Reference the user's verified server-side data provided below (Balance, Income, Expense, Active Habits, Daily Targets).
3. FORMATTING: Use clear Markdown with bullet points, bold highlights for metrics, and concise actionable steps. Keep responses structured and pleasant to read.
4. TONE: Warm, encouraging, disciplined, and insightful.

USER'S VERIFIED REAL-TIME DATA (from Firestore):
${JSON.stringify(context, null, 2)}`;

    // Build chat contents
    const contents: any[] = [];
    
    // Append previous dialogue (up to last 10 messages)
    if (Array.isArray(history)) {
      history.slice(-10).forEach((item: any) => {
        if (item.role && item.text) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          });
        }
      });
    }

    // Append current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await callAdvisorGeminiWithFallback({
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    const responseText = response.text || 'I am reviewing your data and will provide further guidance shortly.';

    return res.json({
      text: responseText,
      role: 'model',
      timestamp: new Date().toISOString(),
      language
    });
  } catch (error: any) {
    console.error('Advisor Chat Error:', error);
    
    // Graceful fallback message in user language
    const fallbackMessages: Record<string, string> = {
      id: 'Saya telah mencatat pertanyaan Anda. Kondisi keuangan dan target Anda tetap terpantau dengan baik di sistem lokal.',
      en: 'I have logged your request. Your financial summaries and daily targets remain safely tracked in your profile.',
      ar: 'تم تسجيل استفسارك بنجاح. تظل بياناتك المالية وأهدافك اليومية محفوظة ومحدثة بأمان.',
      es: 'He registrado tu consulta. Tus resúmenes financieros y metas diarias permanecen sincronizados de forma segura.'
    };

    return res.json({
      text: fallbackMessages[language] || fallbackMessages.en,
      role: 'model',
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
});
