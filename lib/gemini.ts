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

  // Use only models available in the free tier
  const models = [
    "gemini-3-flash",       // User has access to this model
    "gemini-2.5-flash",     // Fast and available in free tier
    "gemini-2.5-flash-lite" // Fallback option
  ];
  const MAX_RETRIES = 2;

  let lastError: any = null;

  for (const modelName of models) {
    let attempts = 0;
    while (attempts <= MAX_RETRIES) {
      try {
        console.log(`[AI] Attempting ${modelName} (Attempt ${attempts + 1}/${MAX_RETRIES + 1})`);

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
        console.error(`[AI Error] ${modelName} failed:`, error.message);
        lastError = error;

        const isUnavailable = error.message?.includes("503") ||
          error.message?.includes("overloaded") ||
          error.message?.includes("429") ||
          error.message?.includes("quota") ||
          error.message?.includes("500") ||
          error.message?.includes("internal source");

        // If it's a 503/429/500, we wait and retry
        if (isUnavailable) {
          attempts++;
          if (attempts <= MAX_RETRIES) {
            // Exponential backoff: 1s, 2s
            const delay = Math.pow(2, attempts) * 1000;
            console.warn(`[AI Warning] ${modelName} overloaded/error. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        // If not unavailable (e.g. 400 Bad Request, Safety), or retries exhausted, try next model
        break;
      }
    }
  }

  // If we get here, all models failed. Throw the last error to preserve the cause (e.g. Safety, 400)
  // instead of a generic "overloaded" message which hides the real issue.
  if (lastError) {
    throw lastError;
  }

  throw new Error("AI service unavailable. All models failed.");
}

export { genAI };
