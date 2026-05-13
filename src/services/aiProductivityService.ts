import { GoogleGenAI, Type } from "@google/genai";
import { DailyQuote, AIProductivityPlan } from "../types";
import quotesData from '../data/quotes.json';

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function generateDailyQuote(): Promise<DailyQuote> {
  const randomIndex = Math.floor(Math.random() * quotesData.length);
  const quote = quotesData[randomIndex];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    text: quote.text,
    author: quote.author,
    field: "1001 Motivational Quotes for Success",
    date: new Date().toISOString().split('T')[0]
  };
}

export async function generateAIProductivityPlan(date: string, language: string = 'en'): Promise<AIProductivityPlan> {
  const langPrompt = language === 'id' ? 'in Indonesian' : 'in English';
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

  const items = JSON.parse(response.text!).map((item: any) => ({
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    completed: false
  }));

  return {
    date,
    items
  };
}
