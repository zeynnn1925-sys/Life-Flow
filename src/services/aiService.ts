import { GoogleGenAI, Type } from "@google/genai";

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

export const scanReceipt = async (base64Image: string, mimeType: string) => {
  const ai = getAI();

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

  if (!response.text) {
    throw new Error("No response from AI");
  }

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response:", response.text);
    throw new Error("Invalid response format from AI");
  }
};
