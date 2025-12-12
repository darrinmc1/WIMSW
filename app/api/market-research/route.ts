import { generateWithFallback } from "@/lib/gemini";
import { performMarketResearch } from "@/lib/perplexity";
import { marketResearchSchema, validateRequest } from "@/lib/validations";
import { rateLimit, getClientIdentifier, marketResearchLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Rate limiting: 10 requests per minute
    const identifier = getClientIdentifier(req);
    const rateLimitResult = await rateLimit(identifier, marketResearchLimiter);

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
    const validation = validateRequest(marketResearchSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { description, isLocalOnly, sizeInput, ageInput, ...itemDetails } = validation.data;

    // Step 1: Use Perplexity for real market research
    const marketResearch = await performMarketResearch({
      name: itemDetails.name,
      brand: itemDetails.brand,
      model: "",
      condition: itemDetails.condition || sizeInput,
      category: itemDetails.category,
    });

    // Step 2: Use Gemini to generate similar items based on market research
    const prompt = `
      Based on real market research, generate similar marketplace listings for this item:

      Item Details: ${JSON.stringify(itemDetails)}
      User Details:
      - Size: "${sizeInput || 'Unknown'}"
      - Age/Era: "${ageInput || 'Unknown'}"
      - Notes: "${description || 'None'}"

      Market Research Findings:
      - Price Range: $${marketResearch.currentPricing.min} - $${marketResearch.currentPricing.max}
      - Average Price: $${marketResearch.currentPricing.average}
      - Market Trends: ${marketResearch.marketTrends}

      Preference: ${isLocalOnly ? "LOCAL PICKUP ONLY" : "GLOBAL SHIPPING"}

      ${isLocalOnly
        ? "PLATFORMS: Facebook Marketplace, OfferUp, Craigslist, Gumtree (pickup-only platforms)."
        : "PLATFORMS: eBay, Poshmark, Mercari, Depop."}

      Return JSON with structure:
      {
        "similar_items": [
          {
            "platform": "string",
            "platform_name": "string",
            "title": "string",
            "price": number (use market research pricing as guide),
            "condition": "string",
            "size": "string",
            "similarity_score": number (0-100),
            "status": "sold|active",
            "sold_date": "string (optional)",
            "search_term": "string"
          }
        ],
        "statistics": {
          "total_found": number,
          "average_price": ${marketResearch.currentPricing.average},
          "lowest_price": ${marketResearch.currentPricing.min},
          "highest_price": ${marketResearch.currentPricing.max},
          "your_price_position": "High|Average|Low|Competitive"
        },
        "insights": {
          "pricing_recommendation": "${marketResearch.recommendations}",
          "market_trend": "Rising|Stable|Falling",
          "best_platform": "string",
          "competition_level": "High|Medium|Low"
        }
      }

      Generate at least 6 similar items. Use realistic prices based on market research above.
    `;

    const text = await generateWithFallback({ prompt, responseMimeType: "application/json" });
    const data = JSON.parse(text);

    // Add market research sources to response
    data.marketResearch = {
      summary: marketResearch.summary,
      sources: marketResearch.sources,
    };

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Market Research Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to research market" },
      { status: 500 }
    );
  }
}
