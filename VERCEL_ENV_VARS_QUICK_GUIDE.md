# 🚨 CRITICAL: Add These Environment Variables to Vercel NOW

## ⚠️ Why Facebook Marketplace Isn't Showing

Your code is deployed, but **Vercel doesn't have the API keys** needed to make it work!

Without `PERPLEXITY_API_KEY`, the app falls back to Gemini-only mode, which doesn't include Facebook Marketplace.

---

## 🔗 Direct Link to Add Variables

**Click here:** https://vercel.com/darrinmc1s-projects/whatismystuffworth/settings/environment-variables

---

## ✅ Add These 4 Variables (Copy & Paste)

### 1. PERPLEXITY_API_KEY ⭐ MOST CRITICAL

```
Key: PERPLEXITY_API_KEY
Value: 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
Environments: ✅ Production ✅ Preview ✅ Development
```

**This is what makes Facebook Marketplace appear!**

---

### 2. GEMINI_API_KEY

```
Key: GEMINI_API_KEY
Value: AIzaSyA6MdJnotdwtCO-j5WmOsxgAv7_Gg3tMeQ
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### 3. NEXTAUTH_SECRET

```
Key: NEXTAUTH_SECRET
Value: c1m0POw3xy1RhQdr3VUdcpsu3YioO7hkSSXtdHdy67s=
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### 4. NEXTAUTH_URL

```
Key: NEXTAUTH_URL
Value: https://wimsw.com
Environments: ✅ Production ONLY
```

---

## 📸 Step-by-Step (5 Minutes)

### Step 1: Go to Environment Variables Page
1. Open: https://vercel.com/darrinmc1s-projects/whatismystuffworth/settings/environment-variables
2. You should see a page with "Add New" button

### Step 2: Add Each Variable
For each of the 4 variables above:

1. Click **"Add New"**
2. In "Key" field: Paste the key name (e.g., `PERPLEXITY_API_KEY`)
3. In "Value" field: Paste the value (e.g., `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`)
4. **Check ALL THREE boxes:** Production, Preview, Development
   - **Except for `NEXTAUTH_URL`** - only check Production
5. Click **"Save"**
6. Repeat for the next variable

### Step 3: Redeploy
After adding all 4 variables:

1. Go to: https://vercel.com/darrinmc1s-projects/whatismystuffworth/deployments
2. Find the latest deployment (at the top)
3. Click the **"..."** button (three dots) on the right
4. Click **"Redeploy"**
5. **UNCHECK** "Use existing Build Cache" ← IMPORTANT!
6. Click **"Redeploy"** button
7. Wait 2-3 minutes for deployment to complete

### Step 4: Test
1. Go to: https://wimsw.com
2. Upload an item
3. Click "Run Market Research"
4. **Facebook Marketplace should now appear!** ✅

---

## 🎯 Quick Checklist

- [ ] Go to Vercel environment variables page
- [ ] Add `PERPLEXITY_API_KEY` (all 3 environments)
- [ ] Add `GEMINI_API_KEY` (all 3 environments)
- [ ] Add `NEXTAUTH_SECRET` (all 3 environments)
- [ ] Add `NEXTAUTH_URL` (Production only)
- [ ] Go to Deployments tab
- [ ] Click "..." → "Redeploy"
- [ ] **Uncheck "Use existing Build Cache"**
- [ ] Click "Redeploy"
- [ ] Wait for deployment
- [ ] Test site - verify Facebook Marketplace appears

---

## 🆘 Still Not Working?

### Check These:

1. **All variables added?**
   - Go to environment variables page
   - Count: Should see 4 variables (+ DATABASE_URL if you added it)

2. **Selected correct environments?**
   - PERPLEXITY_API_KEY: All 3 ✅
   - GEMINI_API_KEY: All 3 ✅
   - NEXTAUTH_SECRET: All 3 ✅
   - NEXTAUTH_URL: Production only ✅

3. **Unchecked Build Cache?**
   - When redeploying, MUST uncheck "Use existing Build Cache"
   - Otherwise, new environment variables won't be loaded

4. **Deployment completed?**
   - Check Deployments tab
   - Status should show "Ready" (not "Building")

### Check Vercel Logs:

1. Go to: https://vercel.com/darrinmc1s-projects/whatismystuffworth/deployments
2. Click on latest deployment
3. Click "Functions" tab
4. Look for `/api/market-research` errors
5. Check if PERPLEXITY_API_KEY is mentioned

---

## 💡 Why This Happens

**Your local app works because:**
- `.env.local` file has all the API keys
- Next.js automatically loads them

**Production doesn't work because:**
- Vercel doesn't have access to your `.env.local` file
- You must manually add environment variables in Vercel dashboard
- Each deployment environment (Production/Preview/Development) needs its own copy

---

## 🔐 Security Note

These API keys are safe to add to Vercel because:
- ✅ They're stored securely in Vercel's encrypted vault
- ✅ They're never exposed to the browser
- ✅ Only your server-side code can access them
- ✅ You can regenerate them anytime if needed

---

## ⏱️ Time Required

- **Adding variables:** 3 minutes
- **Redeployment:** 2 minutes
- **Testing:** 1 minute
- **Total:** ~6 minutes

---

**Once you add these variables and redeploy, Facebook Marketplace WILL appear!** 🎉

The code is already there and working - it just needs the API keys to function.

---

**Last Updated:** 2025-12-21
