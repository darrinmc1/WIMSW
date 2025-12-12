import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

interface GenerateOptions {
  prompt: string;
  imagePart?: {
    inlineData: {
      data: string;
      mimeType: string;
    };
  };
  responseMimeType?: string;
}

/**
 * Generate content with automatic model fallback
 * Tries gemini-3-pro-preview first, then falls back to gemini-flash-latest
 */
export async function generateWithFallback(options: GenerateOptions): Promise<string> {
  const { prompt, imagePart, responseMimeType } = options;

  // Try the user-requested 3.0 Pro model first, then the stable Flash
  const models = ["gemini-3-pro-preview", "gemini-flash-latest"];

  for (const modelName of models) {
    try {
      console.log(`Attempting generation with model: ${modelName}`);

      const generationConfig = responseMimeType
        ? { responseMimeType }
        : undefined;

      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(generationConfig && { generationConfig })
      });

      const content = imagePart ? [prompt, imagePart] : prompt;
      const result = await model.generateContent(content);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error.message);

      // Check for Overloaded (503) OR Rate Limited (429)
      const isUnavailable = error.message?.includes("503") ||
        error.message?.includes("overloaded") ||
        error.message?.includes("429") ||
        error.message?.includes("quota");

      if (isUnavailable && modelName !== models[models.length - 1]) {
        console.log("Switching to fallback model...");
        continue; // Try next model
      }
      throw error; // Rethrow if not a recoverable error or if it's the last model
    }
  }
  throw new Error("All models failed");
}

export { genAI };
