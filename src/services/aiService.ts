export const scanReceipt = async (base64Image: string, mimeType: string) => {
  try {
    const response = await fetch('/api/gemini/scan-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image, mimeType }),
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
