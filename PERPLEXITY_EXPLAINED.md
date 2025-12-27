# 🔍 HOW PERPLEXITY POWERS WIMSW MARKET RESEARCH

## What Perplexity Does in Your App

Perplexity provides **REAL-TIME market pricing data** by searching the web for actual sold listings and current market values.

---

## The Complete Flow

### 1️⃣ **User Uploads Image**
```
User takes photo of Nike shoes
└─> Uploads to WIMSW
```

### 2️⃣ **Gemini Analyzes Image** (First API Call)
```
Gemini AI examines image
├─> Identifies: "Nike Air Jordan 1 Retro High OG"
├─> Brand: "Nike"
├─> Condition: "Used - Good"
├─> Category: "Sneakers"
└─> Color: "Black/Red"
```

### 3️⃣ **Perplexity Searches Web** (Second API Call)
```
Perplexity searches:
"Current resale market value for: Nike Air Jordan 1 Retro High OG
Brand: Nike
Condition: Used - Good
Category: Sneakers

Find SOLD prices from:
- eBay sold listings
- Poshmark sold items  
- Mercari recent sales
- Facebook Marketplace
- Depop sales
- Gumtree (AU/UK)"
```

### 4️⃣ **Perplexity Returns Data**
```json
{
  "currentPricing": {
    "min": 150,
    "max": 280,
    "average": 215
  },
  "sources": [
    {
      "title": "eBay.com",
      "url": "https://ebay.com/...",
      "snippet": "Recently sold for $220"
    },
    {
      "title": "Poshmark.com", 
      "url": "https://poshmark.com/...",
      "snippet": "Sold listings $180-250"
    }
  ],
  "marketTrends": "High demand, prices stable",
  "recommendations": "List on eBay for max visibility, Poshmark for sneaker enthusiasts"
}
```

### 5️⃣ **WIMSW Shows User Results**
```
Your Item: Nike Air Jordan 1 Retro High OG

💰 MARKET PRICING:
├─ Min: $150
├─ Max: $280
└─ Recommended: $215

📊 BEST PLATFORMS:
✓ eBay - $220 avg
✓ Poshmark - $200 avg
✓ Mercari - $185 avg
✓ Depop - $175 avg

📈 MARKET INSIGHTS:
"High demand for this model. Recent sold 
listings show prices stable around $200-230."
```

---

## Why This Is POWERFUL

### Without Perplexity:
❌ User has to manually search each platform
❌ Takes 30+ minutes per item
❌ Easy to miss best prices
❌ No trend data

### With Perplexity:
✅ Instant pricing across ALL platforms
✅ Results in 5-10 seconds
✅ Shows ACTUAL sold prices (not just listings)
✅ Market trends + recommendations
✅ Sources with links

---

## Actual API Request Example

### What WIMSW Sends to Perplexity:

```javascript
const searchQuery = `
What is the current resale market value for: Vintage Levi's 501 Jeans
Brand: Levi's
Model: 501
Condition: Used - Excellent
Category: Vintage Denim

Please provide:
1. Current market prices (min, max, average) from recent 
   sales on eBay, Mercari, Facebook Marketplace, Poshmark
2. Market trends and demand
3. Best platforms to sell on
4. Pricing recommendations

Focus on SOLD listings and actual market data, not asking prices.
`;

// Perplexity searches with:
- Model: "llama-3.1-sonar-large-128k-chat"
- Temperature: 0.2 (factual, not creative)
- Max tokens: 1500
```

### What Perplexity Returns:

```
Based on recent market data:

PRICING:
- Vintage Levi's 501 jeans in excellent condition currently 
  sell for $45-$120, with an average of $75-85.

RECENT SALES:
• eBay: $85 (sold 2 days ago)
• Poshmark: $78 (sold yesterday)
• Depop: $92 (vintage size 32x34, sold this week)

MARKET TRENDS:
Vintage Levi's 501s remain highly sought after, especially in 
larger sizes (32-36 waist). Demand is consistent year-round.

RECOMMENDATIONS:
1. List on Depop for vintage fashion audience ($80-100)
2. eBay for broader reach ($70-90)
3. Poshmark good for quick sales ($65-80)

Sources: eBay sold listings, Poshmark market data, Depop sales
```

### WIMSW Parses This Into:

```javascript
{
  summary: "Based on recent market data: Vintage Levi's 501 
            jeans in excellent condition currently sell for 
            $45-$120, with an average of $75-85...",
  currentPricing: {
    min: 45,
    max: 120,
    average: 82
  },
  sources: [
    { title: "eBay.com", url: "https://ebay.com/...", snippet: "..." },
    { title: "Poshmark.com", url: "https://poshmark.com/...", snippet: "..." }
  ],
  marketTrends: "Vintage Levi's 501s remain highly sought after...",
  recommendations: "1. List on Depop for vintage fashion audience..."
}
```

---

## Where It's Used in the Code

### 1. **API Route** (`app/api/market-research/route.ts`)
```typescript
// After Gemini identifies item:
const marketData = await performMarketResearch({
  name: geminiResult.name,
  brand: geminiResult.brand,
  model: geminiResult.model,
  condition: geminiResult.condition,
  category: geminiResult.category
});
```

### 2. **Perplexity Client** (`lib/perplexity.ts`)
```typescript
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY!,
  baseURL: "https://api.perplexity.ai",
});

// Uses OpenAI SDK with Perplexity endpoint
```

### 3. **Display Results** (`components/market-research/market-results.tsx`)
Shows pricing, platforms, trends to user

---

## Platform-Specific Research

### Global Items (Default):
Searches: **eBay, Poshmark, Mercari, Depop, Gumtree**

```javascript
"Find prices on eBay, Poshmark, Mercari, Depop, Gumtree"
```

### Local-Only Items (isLocalOnly=true):
Searches: **Facebook Marketplace, OfferUp, Craigslist, Gumtree**

```javascript
"Find prices on Facebook Marketplace, OfferUp, 
Craigslist, Gumtree for local pickup items"
```

### Geographic Customization:
- **Australia/UK users** → Gumtree prioritized
- **US users** → eBay, Poshmark, Mercari focus
- **Everyone** → Cross-platform pricing

---

## Cost Analysis

### Per Item Analysis:
- **Gemini API:** 1 request (~$0.0001)
- **Perplexity API:** 1 request (~$0.004)
- **Total:** ~$0.004 per item

### With Perplexity Standard Plan ($20/month):
- 5,000 requests included
- = 5,000 items analyzed
- = $0.004 per item
- Good for 165+ items/day

### Free Tier:
- 5 requests/month
- Just for testing!

---

## Example Use Cases

### 1. **Vintage Clothing**
```
Input: Photo of vintage band t-shirt
Gemini: "1990s Nirvana band t-shirt, vintage"
Perplexity: Searches Depop, eBay, Poshmark
Result: $45-$120, best on Depop ($80 avg)
```

### 2. **Electronics**
```
Input: Photo of iPhone
Gemini: "iPhone 12 Pro, 128GB, unlocked"
Perplexity: Searches eBay, Mercari, Facebook
Result: $350-$450, best on eBay ($400 avg)
```

### 3. **Furniture (Local)**
```
Input: Photo of office chair
Gemini: "Herman Miller Aeron chair, size B"
Perplexity: Searches Facebook, OfferUp, Craigslist
Result: $300-$600 local pickup, Facebook best
```

### 4. **Collectibles**
```
Input: Photo of Pokemon cards
Gemini: "Pokemon Base Set Charizard, near mint"
Perplexity: Searches eBay sold listings
Result: $180-$350 depending on exact condition
```

---

## Security Features

### Input Sanitization:
```typescript
const sanitizedName = sanitizePromptInput(itemDetails.name, 200);
// Prevents: Prompt injection, XSS, malicious queries
```

### Rate Limiting:
- 10 requests per minute per user
- Prevents abuse

### Strike System:
- 3 invalid inputs → 10 min timeout
- Prevents spam/testing

### Caching:
- Same item searched twice → cached result
- Reduces API costs
- 1-hour cache TTL

---

## Testing Without Perplexity

If you don't want to set up Perplexity yet, the app still works:

### Fallback Behavior:
```javascript
return {
  summary: "Unable to fetch live market data. Please check API key.",
  currentPricing: { min: 0, max: 0, average: 0 },
  sources: [],
  marketTrends: "Market data unavailable",
  recommendations: "Unable to provide recommendations"
}
```

User sees:
```
⚠️ Market research unavailable
Gemini analysis still works!
```

---

## Setup Checklist

To enable Perplexity research:

✅ Get API key: https://www.perplexity.ai/settings/api
✅ Add to .env.local: `PERPLEXITY_API_KEY=pplx-xxx`
✅ Restart server: `Ctrl+C` then `npm run dev`
✅ Upload test image
✅ Verify pricing data loads
✅ Check all platforms show results

---

## Next Steps

### Option A: Set Up Now (10 min)
1. Get Perplexity API key
2. Add to .env.local
3. Test with real items
4. See the magic! ✨

### Option B: Test Without It First
1. Add just Gemini key
2. See item identification
3. Add Perplexity later when ready

### Option C: Use Gemini Only
- I can modify code to use Gemini for pricing
- Less accurate but free
- Good for validation testing

---

**What do you want to do?** 🤔

A) Get Perplexity key now and set it up
B) Test with just Gemini first  
C) Show me Gemini-only pricing alternative
D) Deploy to Vercel and worry about APIs later

Generated: December 27, 2024
This is why your app is valuable - instant market research! 💰
