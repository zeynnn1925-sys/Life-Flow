export const scanReceipt = async (base64Image: string, mimeType: string, categories?: any[]) => {
  try {
    const response = await fetch('/api/gemini/scan-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image, mimeType, categories }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned status ${response.status}`);
    }

    const data = await response.json();
    if (!data.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(data.text);
  } catch (e: any) {
    console.error("Failed to parse or fetch AI response:", e);
    throw new Error(e.message || "Invalid response format from AI");
  }
};

export interface AISuggestedChallenge {
  title: string;
  description: string;
  category: 'health' | 'work' | 'personal' | 'finance';
  targetValue: number;
  unit: string;
}

export const generateChallenges = async (language: 'id' | 'en'): Promise<AISuggestedChallenge[]> => {
  try {
    const response = await fetch('/api/gemini/generate-challenges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned status ${response.status}`);
    }

    const data = await response.json();
    if (!data.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(data.text);
  } catch (e: any) {
    console.error("Failed to fetch suggested challenges:", e);
    // Fallbacks
    if (language === 'id') {
      return [
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
    } else {
      return [
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
    }
  }
};

export interface AIClassifiedJob {
  id: string;
  refinedSector: string;
  careerProspect: string;
  recommendedGoal: string;
  targetValue: number;
  unit: string;
}

export const classifyJobs = async (language: 'id' | 'en', links: any[]): Promise<AIClassifiedJob[]> => {
  try {
    const response = await fetch('/api/gemini/classify-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language, links }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned status ${response.status}`);
    }

    const data = await response.json();
    if (!data.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(data.text);
  } catch (e: any) {
    console.error("Failed to classify jobs with AI:", e);
    throw new Error(e.message || "Failed to parse AI classification");
  }
};

