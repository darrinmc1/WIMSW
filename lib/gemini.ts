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

  // Prioritize 1.5 Pro for quality, fallback to 1.5 Flash for speed, and 1.5 Flash-8b as ultra-light backup
  // All must be multimodal (support images)
  // Using -002 and -001 model versions for paid API access
  const models = ["gemini-1.5-pro-002", "gemini-1.5-flash-002", "gemini-1.5-flash-8b-001"];
  const MAX_RETRIES = 3; // Increased to 3 retries

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
            // Exponential backoff: 2s, 4s, 8s
            const delay = Math.pow(2, attempts) * 1000;
            console.warn(`[AI Warning] ${modelName} overloaded/error. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        // Break the while loop to try the next model in the list
        break;
      }
    }
  }
  throw new Error("All AI models are currently overloaded or failing. Please try again in a few moments.");
}

export { genAI };
