import { generateWithFallback } from "@/lib/gemini";
import { generateListingSchema, validateRequest } from "@/lib/validations";
import { rateLimit, getClientIdentifier, analyzeItemLimiter } from "@/lib/rate-limit";
import { sanitizePromptInput, checkInputRelevance } from "@/lib/utils";
import { trackStrike, isBlocked, getStrikeTimeRemaining } from "@/lib/strike-tracker";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // Get client identifier for rate limiting and strike tracking
        const identifier = getClientIdentifier(req);

        // Check if user is blocked due to excessive invalid inputs
        const blocked = await isBlocked(identifier);
        if (blocked) {
            const timeRemaining = await getStrikeTimeRemaining(identifier);
            const minutesRemaining = Math.ceil(timeRemaining / 60);

            return NextResponse.json(
                {
                    success: false,
                    error: `Too many invalid submissions. Please try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`
                },
                {
                    status: 429,
                    headers: { 'X-Strike-Blocked': 'true' }
                }
            );
        }

        // Rate limiting: 5 requests per minute (same as analyze-item)
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
        const validation = validateRequest(generateListingSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { name, brand, category, condition, features } = validation.data;

        // Check relevance of required fields
        const relevanceChecks = [
            { field: name, name: 'Item name' },
            { field: brand, name: 'Brand' },
            { field: category, name: 'Category' },
            { field: condition, name: 'Condition' },
            { field: features, name: 'Features' },
        ];

        for (const check of relevanceChecks) {
            if (!check.field) continue; // Skip optional empty fields

            const relevanceResult = checkInputRelevance(check.field, check.name);
            if (!relevanceResult.isRelevant) {
                // Track strike for invalid input
                const strikes = await trackStrike(identifier);
                const remainingAttempts = 3 - strikes;

                let errorMessage = relevanceResult.reason || 'Invalid input detected.';

                if (strikes < 3) {
                    errorMessage += ` You have ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before being temporarily blocked.`;
                }

                return NextResponse.json(
                    { success: false, error: errorMessage },
                    {
                        status: 400,
                        headers: {
                            'X-Strike-Count': String(strikes),
                            'X-Strikes-Remaining': String(remainingAttempts),
                        }
                    }
                );
            }
        }

        // Sanitize all user inputs to prevent prompt injection
        const sanitizedName = sanitizePromptInput(name, 200);
        const sanitizedBrand = brand ? sanitizePromptInput(brand, 100) : 'N/A';
        const sanitizedCategory = category ? sanitizePromptInput(category, 100) : 'N/A';
        const sanitizedCondition = sanitizePromptInput(condition, 50);
        const sanitizedFeatures = features ? sanitizePromptInput(features, 500) : 'N/A';

        const prompt = `
      You are an expert copywriter for online marketplaces.
      Create optimized ad listings for selling an item on eBay and Facebook Marketplace.

      Item Details:
      - Name: ${sanitizedName}
      - Brand: ${sanitizedBrand}
      - Category: ${sanitizedCategory}
      - Condition: ${sanitizedCondition}
      - Key Features/Notes: ${sanitizedFeatures}

      For **eBay**:
      - Title: Key-word rich, concise, under 80 chars.
      - Description: Professional, detailed, emphasizing condition and features.
      - Pricing Tip: A short tip on pricing strategy.

      For **Facebook Marketplace**:
      - Title: Casual but descriptive.
      - Description: Conversational, emphasizing "must go" or local pickup benefits, mentions condition clearly.
      - Pricing Tip: A short tip on negotiation or pricing.

      For **Gumtree** (Australian focus):
      - Title: Clear, descriptive, includes key details like size/brand.
      - Description: Informative but direct. Mention pickup location availability.
      - Pricing Tip: A tip on negotiation or local market pricing.

      Return the response in this exact JSON format:
      {
        "ebay": {
          "title": "...",
          "description": "...",
          "pricing_tip": "..."
        },
        "facebook": {
          "title": "...",
          "description": "...",
          "pricing_tip": "..."
        },
        "gumtree": {
            "title": "...",
            "description": "...",
            "pricing_tip": "..."
        }
      }
      Do not include markdown formatting (like \`\`\`json). Just return the raw JSON string.
    `;

        const text = await generateWithFallback({ prompt });

        // Clean up potential markdown code blocks
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonString);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Generate Listing Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to generate listing" },
            { status: 500 }
        );
    }
}
