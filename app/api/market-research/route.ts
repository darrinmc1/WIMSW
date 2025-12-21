import { generateWithFallback } from "@/lib/gemini";
import { performMarketResearch } from "@/lib/perplexity";
import { marketResearchSchema, validateRequest } from "@/lib/validations";
import { rateLimit, getClientIdentifier, marketResearchLimiter } from "@/lib/rate-limit";
import { generateCacheKey, withCache, CACHE_TTL } from "@/lib/cache";
import { sanitizePromptInput, checkInputRelevance } from "@/lib/utils";
import { trackStrike, isBlocked, getStrikeCount, getStrikeTimeRemaining } from "@/lib/strike-tracker";
import { NextResponse } from "next/server";
import { MarketResearchResponse } from "@/lib/api-types";

export async function POST(req: Request) {
  try {
    // Get client identifier for rate limiting and strike tracking
    const identifier = getClientIdentifier(req);

    // Check if user is blocked due to excessive invalid inputs
    const blocked = await isBlocked(identifier);
    if (blocked) {
      const timeRemaining = await getStrikeTimeRemaining(identifier);
      const minutesRemaining = Math.ceil(timeRemaining / 60);

      return NextResponse.json<MarketResearchResponse>(
        {
          success: false,
          error: `Too many invalid submissions. Please try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`
        },
        {
          status: 429,
          headers: { 'X-Cache': 'BYPASS', 'X-Strike-Blocked': 'true' }
        }
      );
    }

    // Rate limiting: 10 requests per minute
    const rateLimitResult = await rateLimit(identifier, marketResearchLimiter);

    if (!rateLimitResult.success) {
      return NextResponse.json<MarketResearchResponse>(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetTime),
            'X-Cache': 'BYPASS',
          }
        }
      );
    }

    const body = await req.json();

    // Validate request body
    const validation = validateRequest(marketResearchSchema, body);
    if (!validation.success) {
      return NextResponse.json<MarketResearchResponse>(
        { success: false, error: validation.error },
        { status: 400, headers: { 'X-Cache': 'BYPASS' } }
      );
    }

    const { description, isLocalOnly, sizeInput, ageInput, bustCache, ...itemDetails } = validation.data;

    // Check relevance of required fields
    const relevanceChecks = [
      { field: itemDetails.name, name: 'Item name' },
      { field: itemDetails.brand, name: 'Brand' },
      { field: itemDetails.category, name: 'Category' },
      { field: description, name: 'Description' },
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

        return NextResponse.json<MarketResearchResponse>(
          { success: false, error: errorMessage },
          {
            status: 400,
            headers: {
              'X-Cache': 'BYPASS',
              'X-Strike-Count': String(strikes),
              'X-Strikes-Remaining': String(remainingAttempts),
            }
          }
        );
      }
    }

    // Generate cache key based on item details
    const cacheKey = generateCacheKey('market-research', {
      name: itemDetails.name,
      brand: itemDetails.brand,
      category: itemDetails.category,
      condition: itemDetails.condition,
      isLocalOnly,
    });

    // Check if user wants fresh data
    const shouldBustCache = bustCache === true;

    // Wrap the expensive API calls in cache
    const data = await withCache(
      cacheKey,
      async () => {
        // Step 1: Use Perplexity for real market research
        const marketResearch = await performMarketResearch({
          name: itemDetails.name,
          brand: itemDetails.brand,
          model: "",
          condition: itemDetails.condition || sizeInput,
          category: itemDetails.category,
        });

        // Step 2: Use Gemini to generate similar items based on market research
        // Sanitize all user-provided inputs to prevent prompt injection
        const sanitizedItemDetails = {
          name: sanitizePromptInput(itemDetails.name, 200),
          brand: itemDetails.brand ? sanitizePromptInput(itemDetails.brand, 100) : undefined,
          category: itemDetails.category ? sanitizePromptInput(itemDetails.category, 100) : undefined,
          condition: itemDetails.condition ? sanitizePromptInput(itemDetails.condition, 50) : undefined,
        };
        const sanitizedSize = sizeInput ? sanitizePromptInput(sizeInput, 50) : 'Unknown';
        const sanitizedAge = ageInput ? sanitizePromptInput(ageInput, 50) : 'Unknown';
        const sanitizedDescription = description ? sanitizePromptInput(description, 500) : 'None';

        const prompt = `
      Based on real market research, generate similar marketplace listings for this item:

      Item Details: ${JSON.stringify(sanitizedItemDetails)}
      User Details:
      - Size: "${sanitizedSize}"
      - Age/Era: "${sanitizedAge}"
      - Notes: "${sanitizedDescription}"

      Market Research Findings:
      - Price Range: $${marketResearch.currentPricing.min} - $${marketResearch.currentPricing.max}
      - Average Price: $${marketResearch.currentPricing.average}
      - Market Trends: ${marketResearch.marketTrends}

      Preference: ${isLocalOnly ? "LOCAL PICKUP ONLY" : "GLOBAL SHIPPING"}

      ${isLocalOnly
            ? "PLATFORMS: Facebook Marketplace, OfferUp, Craigslist, Gumtree (pickup-only platforms). Generate at least 1-2 items for EACH platform."
            : "PLATFORMS: eBay, Poshmark, Mercari, Depop, Facebook Marketplace. Generate at least 1-2 items for EACH platform including Facebook Marketplace."}

      CRITICAL: Ensure you include listings for ALL platforms listed above. Facebook Marketplace is required.

      Return JSON with structure:
      {
        "similar_items": [
          {
            "platform": "string (lowercase: ebay, poshmark, mercari, depop, facebook)",
            "platform_name": "string (exact: eBay, Poshmark, Mercari, Depop, Facebook Marketplace)",
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
        const result = JSON.parse(text);

        // Add market research sources to response
        result.marketResearch = {
          summary: marketResearch.summary,
          sources: marketResearch.sources,
        };

        return result;
      },
      CACHE_TTL.MARKET_RESEARCH,
      shouldBustCache
    );

    // Determine if response came from cache
    const cacheStatus = shouldBustCache ? 'MISS' : 'HIT';

    return NextResponse.json<MarketResearchResponse>(
      { success: true, data },
      {
        headers: {
          'X-Cache': cacheStatus,
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );

  } catch (error: any) {
    console.error("Market Research Error:", error);
    return NextResponse.json<MarketResearchResponse>(
      { success: false, error: error.message || "Failed to research market" },
      { status: 500, headers: { 'X-Cache': 'BYPASS' } }
    );
  }
}
