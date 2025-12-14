import { generateWithFallback } from "@/lib/gemini";
import { analyzeItemSchema, validateRequest } from "@/lib/validations";
import { rateLimit, getClientIdentifier, analyzeItemLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // Rate limiting: 5 requests per minute
        const identifier = getClientIdentifier(req);
        const rateLimitResult = await rateLimit(identifier, analyzeItemLimiter);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': String(rateLimitResult.limit),
                        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                        'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                    }
                }
            );
        }

        const body = await req.json();

        // Validate request body
        const validation = validateRequest(analyzeItemSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { image } = validation.data;

        // Prepare image part for Gemini
        // Expecting base64 string like "data:image/jpeg;base64,..."
        const base64Data = image.split(",")[1];
        const mimeType = image.split(",")[0].split(":")[1].split(";")[0];

        // Debug: Check if API key exists
        console.log("Analyze Item Request Received");
        console.log("API Key configured:", !!process.env.GEMINI_API_KEY);

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not configured");
            return NextResponse.json(
                { success: false, error: "AI service not configured. Please contact support." },
                { status: 500 }
            );
        }

        const prompt = `
      Analyze this image of an item to be sold.
      Identify the following details and return them in pure JSON format:
      {
        "name": "Short descriptive title",
        "brand": "Brand name or 'Unknown'",
        "category": "Category (e.g. Clothing, Electronics)",
        "size": "Size if applicable (or 'N/A')",
        "condition": "Estimated condition (e.g. Good, New)",
        "estimated_price": number (conservative estimate in USD)
      }
      Do not include markdown formatting (like \`\`\`json). Just return the raw JSON string.
    `;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType,
            },
        };

        const text = await generateWithFallback({ prompt, imagePart });

        // Clean up potential markdown code blocks if the model ignores the instruction
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonString);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        // Log detailed error information for debugging
        console.error("=== ANALYZE ITEM ERROR ===");
        console.error("Error Type:", error.constructor.name);
        console.error("Error Message:", error.message);
        console.error("Error Status:", error.status);
        console.error("Error Code:", error.code);
        console.error("Full Error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.error("Stack:", error.stack);
        console.error("========================");

        // Parse JSON errors from AI response
        if (error.message?.includes("JSON") || error.message?.includes("parse")) {
            return NextResponse.json(
                { success: false, error: `AI returned invalid format. Try uploading a clearer photo. (Debug: ${error.message})` },
                { status: 500 }
            );
        }

        // Check for API key/permission errors
        if (error.message?.includes("API key") || error.message?.includes("PERMISSION_DENIED") || error.message?.includes("API_KEY_INVALID")) {
            return NextResponse.json(
                { success: false, error: `Gemini API authentication error. Check if your API key is valid and has billing enabled. (Debug: ${error.message})` },
                { status: 500 }
            );
        }

        // Check for rate limit/quota errors
        if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("RESOURCE_EXHAUSTED")) {
            return NextResponse.json(
                { success: false, error: `Gemini API quota exceeded. Wait a minute or check your API billing at https://console.cloud.google.com/` },
                { status: 429 }
            );
        }

        // Check for network/connection errors
        if (error.message?.includes("fetch") || error.message?.includes("network") || error.message?.includes("ECONNREFUSED") || error.message?.includes("ENOTFOUND")) {
            return NextResponse.json(
                { success: false, error: `Cannot reach Gemini API servers. Check your internet connection or Gemini service status. (Debug: ${error.message})` },
                { status: 503 }
            );
        }

        // Check for model errors
        if (error.message?.includes("models") || error.message?.includes("overload")) {
            return NextResponse.json(
                { success: false, error: `All Gemini models are busy or unavailable. Try again in a few seconds. (Debug: ${error.message})` },
                { status: 503 }
            );
        }

        // Return the actual error message for debugging
        return NextResponse.json(
            { success: false, error: `Analysis failed: ${error.message || "Unknown error"}. Check server logs for details.` },
            { status: 500 }
        );
    }
}
