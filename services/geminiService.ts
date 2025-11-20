import { GoogleGenAI, Chat } from "@google/genai";

export const ensureApiKey = async () => {
  // @ts-ignore
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  }
};

export const createChatSession = async (): Promise<Chat> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a helpful AI assistant for a Smartphone POS/ERP system. You help managers track stock, suggest business strategies, and draft emails to customers.",
    },
  });
};

export const generateImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
  await ensureApiKey();

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: '1:1'
      }
    }
  });

  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image data generated");
};
