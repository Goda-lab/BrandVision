
import { GoogleGenAI } from "@google/genai";
import { ImageSize } from "../types";

// Helper to ensure we have the latest API key for Pro models
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateMockup = async (prompt: string, size: ImageSize): Promise<string | null> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `High quality product mockup: ${prompt}. Professional lighting, studio quality, realistic textures.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_RESET_REQUIRED");
    }
    console.error("Error generating image:", error);
    throw error;
  }
  return null;
};

export const editMockup = async (baseImageBase64: string, prompt: string): Promise<string | null> => {
  const ai = getAIClient();
  const base64Data = baseImageBase64.split(',')[1];
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png',
            },
          },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
  return null;
};
