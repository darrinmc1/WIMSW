# PERPLEXITY API SETUP GUIDE

## Getting Your Perplexity API Key

### Step 1: Create Account & Get API Key

1. **Go to Perplexity API:**
   - URL: https://www.perplexity.ai/settings/api
   - Or: https://docs.perplexity.ai/guides/getting-started

2. **Sign Up / Log In:**
   - Use your existing Perplexity account
   - Or create a new one (free)

3. **Navigate to API Settings:**
   - Click on your profile (top right)
   - Select "API"
   - Or go directly to: https://www.perplexity.ai/settings/api

4. **Generate API Key:**
   - Click "Generate API Key"
   - Copy the key (starts with `pplx-...`)
   - **IMPORTANT:** Save it somewhere safe - you can only see it once!

---

## Step 2: Add to .env.local

Open your `.env.local` file:
```
C:\Users\Darrin\Desktop\WIMSW\WIMSW\.env.local
```

Add this line:
```env
PERPLEXITY_API_KEY=pplx-your-key-here
```

---

## Step 3: Generate NEXTAUTH_SECRET

While you're editing .env.local, also add the NEXTAUTH_SECRET:

### Option A: Quick Generate (PowerShell)
Run this command:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option B: Use Online Generator
Go to: https://generate-secret.vercel.app/32

Copy the generated string and add to .env.local:
```env
NEXTAUTH_SECRET=your-generated-secret-here
```

---

## Complete .env.local Template

Your `.env.local` should look like this:

```env
# AI APIs
GEMINI_API_KEY=your-gemini-key-here
PERPLEXITY_API_KEY=pplx-your-perplexity-key-here

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Database (optional - for now)
DATABASE_URL=postgresql://user:password@localhost:5432/wimsw

# Google Sheets (legacy - optional)
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SPREADSHEET_ID=

# Rate Limiting (optional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email (optional)
RESEND_API_KEY=

# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Sentry (optional)
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Step 4: Restart Dev Server

After adding the keys:

1. **Stop the server:**
   - Press `Ctrl+C` in PowerShell

2. **Restart:**
   ```powershell
   npm run dev
   ```

3. **Open browser:**
   - http://localhost:3000

---

## Testing Perplexity Integration

### What Perplexity Does in WIMSW:

1. **Market Research API Route:**
   - File: `app/api/market-research/route.ts`
   - Searches for current market prices
   - Finds similar sold items
   - Provides pricing insights

2. **How It Works:**
   - User uploads item image
   - Gemini analyzes image → identifies item
   - Perplexity searches web for current prices
   - Returns pricing data from eBay, Poshmark, etc.

3. **Example Query:**
   ```
   "What are current resale prices for [item name] on eBay, 
   Poshmark, Mercari, Depop? Include recent sold listings."
   ```

### Test Flow:

1. **Upload an item image**
   - e.g., photo of sneakers, vintage jacket, electronics

2. **Click "Analyze Item"**
   - Gemini identifies: "Nike Air Jordan 1 Retro High"

3. **View Market Research**
   - Perplexity searches current prices
   - Shows: eBay ($150-250), Poshmark ($180), etc.
   - Recommends optimal price

---

## Perplexity API Pricing

### Free Tier:
- **5 requests/month** - Very limited
- Good for initial testing only

### Paid Plans:
- **Standard:** $20/month
  - 5,000 requests
  - Sonar model (online search)
  - Best for your use case

- **Pro:** (if you need more)
  - 50,000+ requests
  - Advanced models

### For WIMSW:
- Each item analysis = 1 Perplexity request
- Standard plan = 5,000 items/month
- **Recommendation:** Start with Standard ($20/mo)

---

## Alternative: Use Gemini for Research

If you don't want to pay for Perplexity, you can modify the code to use Gemini's web search capabilities instead:

**Pros:**
- Free (with Gemini API free tier)
- 1500 requests/day free tier

**Cons:**
- Not as accurate for real-time pricing
- May not have latest sold listings

Let me know if you want me to create a Gemini-only version!

---

## Troubleshooting

### Error: "PERPLEXITY_API_KEY is not defined"
**Solution:** 
- Make sure .env.local exists in project root
- Restart dev server after adding key

### Error: "Invalid API key"
**Solution:**
- Check key starts with `pplx-`
- No extra spaces in .env.local
- Key must be on same line as `PERPLEXITY_API_KEY=`

### Error: "Rate limit exceeded"
**Solution:**
- You've hit free tier limit (5/month)
- Upgrade to Standard plan
- Or wait until next month

---

## File References

### Where Perplexity is Used:

1. **API Route:**
   ```
   app/api/market-research/route.ts
   ```

2. **Market Results Component:**
   ```
   components/market-research/market-results.tsx
   ```

3. **Environment Validation:**
   ```
   lib/env.ts
   ```

---

## Next Steps After Setup:

✅ Get Perplexity API key
✅ Add to .env.local
✅ Restart server
✅ Test with real item upload
✅ Verify pricing data loads
✅ Check all 6 platforms show prices

---

Generated: December 27, 2024
Status: READY TO SET UP
Estimated Time: 10 minutes
