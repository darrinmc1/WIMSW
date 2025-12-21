import { generateWithFallback } from "@/lib/gemini";
import { generateListingSchema, validateRequest } from "@/lib/validations";
import { rateLimit, getClientIdentifier, analyzeItemLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // Rate limiting: 5 requests per minute (same as analyze-item)
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
        const validation = validateRequest(generateListingSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { name, brand, category, condition, features } = validation.data;

        const prompt = `
      You are an expert copywriter for online marketplaces.
      Create optimized ad listings for selling an item on eBay and Facebook Marketplace.
      
      Item Details:
      - Name: ${name}
      - Brand: ${brand || 'N/A'}
      - Category: ${category || 'N/A'}
      - Condition: ${condition}
      - Key Features/Notes: ${features || 'N/A'}

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
