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
        console.error("Analyze Item Error Object:", JSON.stringify(error, null, 2));
        console.error("Analyze Item Error Message:", error.message);

        // Check for rate limit error
        if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota")) {
            return NextResponse.json(
                { success: false, error: "System busy. Please try again in a minute." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message || "Failed to analyze item" },
            { status: 500 }
        );
    }
}
