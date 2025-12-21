# Vercel Environment Variables Setup Guide

## 🎯 Purpose
This guide will help you configure the required environment variables in Vercel to fix the **Facebook Marketplace missing** issue and ensure the app works correctly.

---

## ⚠️ Current Issue

**Facebook Marketplace is not appearing in your deployed app** because the `PERPLEXITY_API_KEY` is likely missing or misconfigured in Vercel.

### Why Facebook Marketplace Depends on Perplexity API:
1. The app uses **Perplexity AI** to search for real market data across platforms
2. Perplexity searches eBay, Mercari, Poshmark, Depop, and **Facebook Marketplace**
3. If Perplexity API fails, the app falls back to Gemini (which may not consistently include Facebook)

---

## 🔑 Required Environment Variables

### 1. **PERPLEXITY_API_KEY** ⭐ CRITICAL FOR FACEBOOK MARKETPLACE

**What it does:** Powers real-time market research across all platforms including Facebook Marketplace

**How to get it:**
1. Go to: https://www.perplexity.ai/settings/api
2. Sign up or log in
3. Click "Generate API Key"
4. Copy the key (starts with `pplx-...`)

**Where to add in Vercel:**
```
Key: PERPLEXITY_API_KEY
Value: pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environment: Production, Preview, Development
```

---

### 2. **GEMINI_API_KEY** ⭐ CRITICAL

**What it does:** Powers AI image analysis to identify items

**How to get it:**
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

**Where to add in Vercel:**
```
Key: GEMINI_API_KEY
Value: AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environment: Production, Preview, Development
```

---

### 3. **DATABASE_URL** ⭐ CRITICAL

**What it does:** PostgreSQL database connection for user data, research history, etc.

**How to get it:**
If you're using Vercel Postgres:
1. Go to your project in Vercel
2. Click "Storage" tab
3. Click "Create Database" → Select "Postgres"
4. Once created, click "Connect" → Copy the `DATABASE_URL`

**Where to add in Vercel:**
```
Key: DATABASE_URL
Value: postgres://username:password@host:5432/database
Environment: Production, Preview, Development
```

---

### 4. **DIRECT_URL** (Recommended)

**What it does:** Direct database connection for Prisma migrations

**How to get it:** Same as DATABASE_URL but with `?sslmode=require` instead of pooling

```
Key: DIRECT_URL
Value: postgres://username:password@host:5432/database?sslmode=require
Environment: Production, Preview, Development
```

---

### 5. **NEXTAUTH_SECRET** ⭐ CRITICAL

**What it does:** Secures user authentication sessions

**How to generate:**
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Where to add in Vercel:**
```
Key: NEXTAUTH_SECRET
Value: (paste the generated secret)
Environment: Production, Preview, Development
```

---

### 6. **NEXTAUTH_URL** (Production)

**What it does:** Tells NextAuth.js your production URL

**Value:**
```
Key: NEXTAUTH_URL
Value: https://whatismystuffworth.vercel.app
Environment: Production only
```

---

## 📦 Optional (Recommended for Production)

### **UPSTASH_REDIS_REST_URL** & **UPSTASH_REDIS_REST_TOKEN**

**What they do:** Enable proper rate limiting in production (prevents API abuse)

**How to get them:**
1. Go to: https://upstash.com/
2. Sign up for free tier
3. Create a Redis database
4. Copy the REST URL and Token

```
Key: UPSTASH_REDIS_REST_URL
Value: https://your-redis-url.upstash.io
Environment: Production, Preview

Key: UPSTASH_REDIS_REST_TOKEN
Value: your-redis-token-here
Environment: Production, Preview
```

**Without these:** The app will use in-memory rate limiting (works but resets on deployment)

---

## 🗄️ Legacy Variables (Optional - Being Migrated)

These are for the old Google Sheets backend. You can skip these if you're using PostgreSQL:

- `GOOGLE_SHEET_ID`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

---

## 🚀 How to Add Variables to Vercel

### Step-by-Step:

1. **Go to your Vercel project:**
   https://vercel.com/darrinmc1s-projects/whatismystuffworth

2. **Click "Settings" tab** at the top

3. **Click "Environment Variables"** in the left sidebar

4. **For each variable:**
   - Click "Add New"
   - Enter the **Key** (e.g., `PERPLEXITY_API_KEY`)
   - Enter the **Value** (your actual API key)
   - Select environments: Check **Production**, **Preview**, and **Development**
   - Click "Save"

5. **After adding all variables:**
   - Go to "Deployments" tab
   - Click the three dots `...` on your latest deployment
   - Click "Redeploy" → Check "Use existing Build Cache" off
   - Click "Redeploy"

---

## ✅ Verify Setup

### After redeploying, check:

1. **Visit your app:** https://whatismystuffworth.vercel.app
2. **Upload an item image**
3. **Click "Run Market Research"**
4. **Verify Facebook Marketplace appears** in the results

### If Facebook still doesn't appear:

1. Check Vercel logs:
   - Go to "Deployments" tab
   - Click on the latest deployment
   - Click "Functions" → Find `/api/market-research`
   - Check for errors mentioning Perplexity

2. Run the diagnostic script locally:
   ```bash
   npx tsx scripts/check-env.ts
   ```

---

## 🐛 Troubleshooting

### Issue: "PERPLEXITY_API_KEY is required" error

**Solution:**
- Check that you added the variable to ALL environments (Production, Preview, Development)
- Ensure there are no extra spaces in the key or value
- Redeploy after adding the variable

### Issue: Facebook Marketplace still missing

**Possible causes:**
1. **Perplexity API quota exceeded** - Check your Perplexity dashboard
2. **API key invalid** - Regenerate the key
3. **Caching issue** - Wait 1 hour or clear cache in code

**Debugging:**
Add this to `app/api/market-research/route.ts` after line 66:
```typescript
console.log('[DEBUG] Perplexity API Key exists:', !!process.env.PERPLEXITY_API_KEY);
console.log('[DEBUG] Market research result:', JSON.stringify(marketResearch));
```

Then check Vercel logs after running a search.

### Issue: Database connection errors

**Solution:**
- Verify `DATABASE_URL` is correct
- Ensure database allows connections from Vercel
- Run migrations: `npm run db:migrate:deploy`

---

## 📊 Cost Estimates

All recommended services have free tiers:

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| **Perplexity API** | $5 free credit | ~$0.005/request |
| **Google Gemini** | 1,500 requests/day free | ~$0.001/request |
| **Vercel Postgres** | 60 hours compute/month | $0.102/hour after |
| **Upstash Redis** | 10,000 requests/day free | $0.20/100K after |

**Estimated monthly cost for low traffic:** $0-5/month

---

## 🎯 Priority Setup Order

1. ✅ **GEMINI_API_KEY** - Get the app working
2. ✅ **PERPLEXITY_API_KEY** - Fix Facebook Marketplace ⭐
3. ✅ **DATABASE_URL** - Enable user accounts & history
4. ✅ **NEXTAUTH_SECRET** - Secure authentication
5. ⭐ **NEXTAUTH_URL** - Production authentication
6. 📦 **UPSTASH_REDIS** - Production rate limiting
7. 📦 **SENTRY_DSN** - Error tracking (optional)

---

## 📞 Support

If you continue having issues:
1. Check Vercel deployment logs
2. Run `npx tsx scripts/check-env.ts` locally
3. Open an issue on GitHub with error logs

---

**Last Updated:** 2025-12-21
