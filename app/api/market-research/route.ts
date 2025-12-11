
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { description, ...itemDetails } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
      generationConfig: { responseMimeType: "application/json" } // Force JSON mode
    });

    const prompt = `
      Perform market research for this item:
      Item Details (AI Analyzed): ${JSON.stringify(itemDetails)}
      User Description/Notes: "${description || 'None provided'}"

      Generate realistic "similar items" that might be found on marketplaces like eBay, Poshmark, Mercari, Facebook, Depop.
      Also provide market statistics and insights.

      Return the data strictly in this JSON structure:
      {
        "similar_items": [
          {
            "platform": "eBay|Poshmark|Mercari|Facebook|Depop",
            "platform_name": "string",
            "title": "string",
            "price": number,
            "condition": "string",
            "size": "string",
            "similarity_score": number (0-100),
            "status": "sold|active",
            "sold_date": "string (optional, e.g. 'Oct 12')",
            "url": "string (Search Query Rules: 1. MAX 3 KEYWORDS. 2. Use ONLY 'Brand + Item Name'. 3. REMOVE 'vintage', 'size', 'color', 'condition' from url query. Example: 'https://www.depop.com/search/?q=Adidas%20Jacket')"
          }
        ],
        "statistics": {
          "total_found": number,
          "average_price": number,
          "lowest_price": number,
          "highest_price": number,
          "your_price_position": "High|Average|Low|Competitive"
        },
        "insights": {
          "pricing_recommendation": "string",
          "market_trend": "Rising|Stable|Falling",
          "best_platform": "string",
          "competition_level": "High|Medium|Low"
        }
      }
      
      Ensure you generate at least 6 similar items mixed between sold and active.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const data = JSON.parse(text);

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Market Research Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to research market" },
      { status: 500 }
    );
  }
}
