import { generateWithFallback } from "@/lib/gemini";
import { analyzeItemSchema, validateRequest } from "@/lib/validations";
import { rateLimit, getClientIdentifier, analyzeItemLimiter, freeUserLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        // Check authentication status
        const session = await getServerSession(authOptions);
        const isAuthenticated = !!session;

        // Rate limiting: Free users get 3/day, authenticated users get 5/minute
        const identifier = getClientIdentifier(req);
        const limiter = isAuthenticated ? analyzeItemLimiter : freeUserLimiter;
        const rateLimitResult = await rateLimit(identifier, limiter);

        if (!rateLimitResult.success) {
            const errorMessage = isAuthenticated
                ? "Too many requests. Please try again later."
                : "You've reached your free daily limit of 2 analyses. Sign up to continue analyzing items!";

            return NextResponse.json(
                {
                    success: false,
                    error: errorMessage,
                    requiresAuth: !isAuthenticated
                },
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
        // Generate unique error ID for tracking
        const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Log detailed error information for admins to review in Vercel logs
        console.error("=== ANALYZE ITEM ERROR ===");
        console.error("Error ID:", errorId);
        console.error("Timestamp:", new Date().toISOString());
        console.error("Error Type:", error.constructor.name);
        console.error("Error Message:", error.message);
        console.error("Error Status:", error.status);
        console.error("Error Code:", error.code);
        console.error("Full Error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.error("Stack:", error.stack);
        console.error("========================");

        // Determine user-friendly and admin messages
        let userMessage = `Something went wrong analyzing your item. Debug Error: ${error.message}`;
        let adminDebug = error.message || "Unknown error";

        // Parse JSON errors from AI response
        if (error.message?.includes("JSON") || error.message?.includes("parse")) {
            userMessage = "The AI couldn't analyze this image. Try uploading a clearer photo.";
            adminDebug = `JSON Parse Error: ${error.message}`;
        }
        // Check for API key/permission errors
        else if (error.message?.includes("API key") || error.message?.includes("PERMISSION_DENIED") || error.message?.includes("API_KEY_INVALID")) {
            userMessage = "Our AI service is temporarily unavailable. Please try again later or contact support.";
            adminDebug = `Gemini API Authentication Failed: ${error.message}. Check API key validity and billing at https://console.cloud.google.com/`;
        }
        // Check for rate limit/quota errors
        else if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("RESOURCE_EXHAUSTED")) {
            userMessage = "We're experiencing high demand. Please wait a minute and try again.";
            adminDebug = `Gemini API Quota Exceeded: ${error.message}. Check billing and quotas at https://console.cloud.google.com/`;
        }
        // Check for network/connection errors
        else if (error.message?.includes("fetch") || error.message?.includes("network") || error.message?.includes("ECONNREFUSED") || error.message?.includes("ENOTFOUND")) {
            userMessage = "Network error. Please check your internet connection and try again.";
            adminDebug = `Network/Connection Error: ${error.message}. Cannot reach Gemini API servers.`;
        }
        // Check for model errors
        else if (error.message?.includes("models") || error.message?.includes("overload")) {
            userMessage = "Our AI is currently overloaded. Please try again in a few seconds.";
            adminDebug = `Gemini Model Overload: ${error.message}. All models are busy or unavailable.`;
        }

        // Return response with user-friendly message and admin debug info in headers
        return NextResponse.json(
            {
                success: false,
                error: userMessage,
                errorId: errorId  // Users can provide this when contacting support
            },
            {
                status: error.status || 500,
                headers: {
                    'X-Error-ID': errorId,
                    'X-Error-Debug': adminDebug,
                    'X-Error-Timestamp': new Date().toISOString()
                }
            }
        );
    }
}
