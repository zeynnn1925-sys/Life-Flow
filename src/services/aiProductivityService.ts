import { DailyQuote, AIProductivityPlan } from "../types";
import quotesData from '../data/quotes.json';

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
  try {
    const response = await fetch('/api/gemini/productivity-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, language }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error ${response.status}`);
    }

    const data = await response.json();
    if (!data.text) {
      throw new Error("No response from AI");
    }

    const items = JSON.parse(data.text).map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      completed: false
    }));

    return {
      date,
      items
    };
  } catch (error: any) {
    console.error("Failed to generate AI productivity plan:", error);
    throw new Error(error.message || "Failed to generate plan");
  }
}
