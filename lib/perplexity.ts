import OpenAI from "openai";

// Perplexity uses OpenAI-compatible API
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY!,
  baseURL: "https://api.perplexity.ai",
});

export interface MarketResearchResult {
  summary: string;
  currentPricing: {
    min: number;
    max: number;
    average: number;
  };
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  marketTrends: string;
  recommendations: string;
}

/**
 * Perform market research using Perplexity AI
 * @param itemDetails - Details about the item from Gemini identification
 */
export async function performMarketResearch(itemDetails: {
  name: string;
  brand?: string;
  model?: string;
  condition?: string;
  category?: string;
}): Promise<MarketResearchResult> {
  try {
    const { name, brand, model, condition, category } = itemDetails;

    // Construct a detailed search query
    const searchQuery = `
What is the current resale market value for: ${name}
${brand ? `Brand: ${brand}` : ''}
${model ? `Model: ${model}` : ''}
${condition ? `Condition: ${condition}` : ''}
${category ? `Category: ${category}` : ''}

Please provide:
1. Current market prices (min, max, average) from recent sales on platforms like eBay, Mercari, Facebook Marketplace, Poshmark
2. Market trends and demand
3. Best platforms to sell on
4. Pricing recommendations

Focus on SOLD listings and actual market data, not just asking prices.
`.trim();

    const response = await perplexity.chat.completions.create({
      model: "llama-3.1-sonar-large-128k-chat",
      messages: [
        {
          role: "system",
          content: "You are a market research expert specializing in resale pricing. Provide accurate, data-driven pricing information with sources. Focus on actual sold prices, not listing prices.",
        },
        {
          role: "user",
          content: searchQuery,
        },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || "";

    // Parse the response to extract structured data
    const result = parseMarketResearchResponse(content, itemDetails);

    return result;
  } catch (error: any) {
    console.error("Error performing market research:", error);

    // Return a fallback result
    return {
      summary: `Unable to fetch live market data for ${itemDetails.name}. Please check your Perplexity API key.`,
      currentPricing: {
        min: 0,
        max: 0,
        average: 0,
      },
      sources: [],
      marketTrends: "Market data unavailable",
      recommendations: "Unable to provide recommendations without market data",
    };
  }
}

/**
 * Parse Perplexity's response into structured market research data
 */
function parseMarketResearchResponse(
  content: string,
  itemDetails: { name: string }
): MarketResearchResult {
  // Extract pricing information using regex
  const priceMatches = content.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g) || [];
  const prices = priceMatches.map(p => parseFloat(p.replace(/[$,]/g, "")));

  const min = prices.length > 0 ? Math.min(...prices) : 0;
  const max = prices.length > 0 ? Math.max(...prices) : 0;
  const average = prices.length > 0
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : 0;

  // Extract sources (simplified - Perplexity includes citations)
  const urlMatches = content.match(/https?:\/\/[^\s\)]+/g) || [];
  const sources = urlMatches.slice(0, 5).map(url => ({
    title: extractDomainName(url),
    url: url,
    snippet: "Source from market research",
  }));

  // Split content into sections
  const sections = content.split("\n\n");
  const marketTrends = sections.find(s =>
    s.toLowerCase().includes("trend") ||
    s.toLowerCase().includes("demand") ||
    s.toLowerCase().includes("market")
  ) || "Market trends data available in full research";

  const recommendations = sections.find(s =>
    s.toLowerCase().includes("recommend") ||
    s.toLowerCase().includes("best") ||
    s.toLowerCase().includes("platform")
  ) || "See full research for recommendations";

  return {
    summary: content.slice(0, 300) + (content.length > 300 ? "..." : ""),
    currentPricing: {
      min,
      max,
      average,
    },
    sources,
    marketTrends: marketTrends.slice(0, 200),
    recommendations: recommendations.slice(0, 200),
  };
}

/**
 * Extract domain name from URL for display
 */
function extractDomainName(url: string): string {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return "Source";
  }
}
