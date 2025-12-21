# 📦 Environment Setup - What Was Created

## ✅ Files Created

I've created several files to help you set up your environment variables:

### 1. **`.env.local`** - Your Local Environment File
- **Location:** Root directory
- **Purpose:** Stores your API keys for local development
- **Status:** ⚠️ **YOU NEED TO EDIT THIS FILE**
- **What to do:**
  1. Open `.env.local` in your editor
  2. Replace all `your_xxx_here` values with actual API keys
  3. Save the file
  4. Restart dev server

**Quick edit command:**
```bash
code .env.local    # VS Code
notepad .env.local # Notepad
```

---

### 2. **`scripts/check-env.ts`** - Environment Diagnostic Tool
- **Purpose:** Checks which environment variables are configured
- **Usage:**
  ```bash
  npx tsx scripts/check-env.ts
  ```
- **When to use:**
  - After editing `.env.local` to verify setup
  - Before deploying to check for missing variables
  - When debugging environment issues

**Example output:**
```
✅ SET GEMINI_API_KEY
❌ MISSING PERPLEXITY_API_KEY
```

---

### 3. **`scripts/setup-env.ts`** - Interactive Setup Helper
- **Purpose:** Guides you through setting up environment variables
- **Usage:**
  ```bash
  npx tsx scripts/setup-env.ts
  ```
- **Features:**
  - Interactive prompts for each variable
  - Auto-generates NEXTAUTH_SECRET
  - Creates properly formatted `.env.local`

**When to use:** If you prefer guided setup over manual editing

---

### 4. **`VERCEL_SETUP_GUIDE.md`** - Vercel Deployment Guide
- **Purpose:** Complete guide for setting up environment variables in Vercel
- **Contains:**
  - Step-by-step Vercel dashboard instructions
  - How to get each API key
  - Troubleshooting tips
  - Cost estimates
  - Priority setup order

**Direct link to your Vercel settings:**
https://vercel.com/darrinmc1s-projects/whatismystuffworth/settings/environment-variables

---

### 5. **`QUICK_START.md`** - Quick Start Guide
- **Purpose:** Get your local dev environment running in 5 minutes
- **Contains:**
  - Complete setup instructions
  - API key guides
  - Database setup
  - Troubleshooting
  - Deployment instructions

---

## 🎯 Next Steps - DO THIS NOW

### For Local Development:

1. **Edit `.env.local`** (required)
   ```bash
   # Open in your editor
   code .env.local
   ```

2. **Add your API keys** (at minimum, add these two):
   - `GEMINI_API_KEY` - Get from https://aistudio.google.com/app/apikey
   - `PERPLEXITY_API_KEY` - Get from https://www.perplexity.ai/settings/api ⭐

3. **Verify setup:**
   ```bash
   npx tsx scripts/check-env.ts
   ```

4. **Start development:**
   ```bash
   npm install
   npm run dev
   ```

---

### For Vercel Production:

1. **Go to Vercel dashboard:**
   https://vercel.com/darrinmc1s-projects/whatismystuffworth/settings/environment-variables

2. **Add these critical variables:**
   - ✅ `PERPLEXITY_API_KEY` ⭐ **FIX FOR FACEBOOK MARKETPLACE**
   - ✅ `GEMINI_API_KEY`
   - ✅ `DATABASE_URL`
   - ✅ `NEXTAUTH_SECRET`
   - ✅ `NEXTAUTH_URL` (set to: `https://whatismystuffworth.vercel.app`)

3. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." → "Redeploy"
   - Uncheck "Use existing Build Cache"

4. **Test:**
   - Visit your app
   - Upload an item
   - Verify Facebook Marketplace appears in results

---

## 📊 API Keys Priority

### **Must Have (App won't work without these):**
1. 🔴 **PERPLEXITY_API_KEY** - Critical for Facebook Marketplace
2. 🔴 **GEMINI_API_KEY** - Critical for image analysis
3. 🔴 **DATABASE_URL** - Critical for data storage
4. 🔴 **NEXTAUTH_SECRET** - Critical for authentication

### **Should Have (Production):**
5. 🟡 **NEXTAUTH_URL** - For production authentication
6. 🟡 **UPSTASH_REDIS_REST_URL** - For production rate limiting
7. 🟡 **UPSTASH_REDIS_REST_TOKEN** - For production rate limiting

### **Nice to Have (Optional):**
8. 🟢 **SENTRY_DSN** - Error tracking
9. 🟢 **NEXT_PUBLIC_SENTRY_DSN** - Client-side error tracking

---

## 🔑 Where to Get API Keys

| Service | URL | Free Tier |
|---------|-----|-----------|
| **Perplexity AI** | https://www.perplexity.ai/settings/api | $5 credit |
| **Google Gemini** | https://aistudio.google.com/app/apikey | 1,500 req/day |
| **Vercel Postgres** | Via Vercel dashboard | 60 hrs/month |
| **Upstash Redis** | https://upstash.com/ | 10K req/day |
| **Sentry** | https://sentry.io/ | 5K events/month |

---

## ⚠️ Important Notes

### Security:
- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ Never share your API keys publicly
- ✅ Rotate keys if accidentally exposed

### Development vs Production:
- **Local:** Uses `.env.local` file
- **Vercel:** Uses environment variables from dashboard
- **Both need the same variables!**

### Cost:
- All services have generous free tiers
- Estimated cost for low traffic: **$0-5/month**
- Only pay if you exceed free limits

---

## 🧪 Testing Your Setup

### Local Testing:
```bash
# 1. Check environment
npx tsx scripts/check-env.ts

# 2. Start dev server
npm run dev

# 3. Test app
# - Open http://localhost:3000
# - Upload an item image
# - Click "Run Market Research"
# - Verify Facebook Marketplace appears
```

### Vercel Testing:
```bash
# 1. Deploy to Vercel
git push origin main

# 2. Check deployment logs
# Go to Vercel dashboard → Deployments → Click latest → Functions

# 3. Test live app
# Visit: https://whatismystuffworth.vercel.app
# Upload item and verify Facebook Marketplace appears
```

---

## 🆘 Troubleshooting

### Problem: "PERPLEXITY_API_KEY is required"

**Solution:**
1. Check `.env.local` has the key
2. Ensure no spaces: `PERPLEXITY_API_KEY=pplx-xxx` (not `PERPLEXITY_API_KEY = pplx-xxx`)
3. Restart dev server
4. Run `npx tsx scripts/check-env.ts`

### Problem: Facebook Marketplace still missing in production

**Solution:**
1. Verify key is in Vercel: https://vercel.com/darrinmc1s-projects/whatismystuffworth/settings/environment-variables
2. Check it's in **Production** environment (not just Preview)
3. Redeploy with cache cleared
4. Check Vercel function logs for errors

### Problem: Can't get Perplexity API key

**Alternative:** The app can work with just Gemini, but Facebook Marketplace may not appear consistently.

To improve Gemini-only results, I can help you modify the code to force Facebook Marketplace items.

---

## 📞 Need Help?

1. **Check your setup:**
   ```bash
   npx tsx scripts/check-env.ts
   ```

2. **Read the guides:**
   - [QUICK_START.md](QUICK_START.md) - Local development
   - [VERCEL_SETUP_GUIDE.md](VERCEL_SETUP_GUIDE.md) - Production deployment

3. **Common issues:**
   - See "Troubleshooting" section above
   - Check [VERCEL_SETUP_GUIDE.md](VERCEL_SETUP_GUIDE.md) troubleshooting section

4. **Still stuck?**
   - Open a GitHub issue with output from `npx tsx scripts/check-env.ts`

---

## ✅ Checklist

Before you can run the app, complete these:

### Local Development:
- [ ] Created/edited `.env.local` file
- [ ] Added `GEMINI_API_KEY`
- [ ] Added `PERPLEXITY_API_KEY` ⭐
- [ ] Added `DATABASE_URL`
- [ ] Added `NEXTAUTH_SECRET`
- [ ] Ran `npx tsx scripts/check-env.ts` (all green ✅)
- [ ] Ran `npm install`
- [ ] Ran `npm run db:push`
- [ ] Started dev server (`npm run dev`)
- [ ] Tested app works

### Vercel Production:
- [ ] Added all variables to Vercel dashboard
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Redeployed app
- [ ] Tested production app
- [ ] Verified Facebook Marketplace appears

---

**Status:** 📝 Setup files created - **YOU NEED TO ADD YOUR API KEYS**

**Next:** Edit `.env.local` and add your API keys, then run `npm run dev`

---

**Created:** 2025-12-21
**Last Updated:** 2025-12-21
