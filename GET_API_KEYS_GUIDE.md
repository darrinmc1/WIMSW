# 🔑 Step-by-Step API Key Setup Guide

Follow these steps in order to get all the API keys you need.

---

## ✅ **Step 1: Generate NEXTAUTH_SECRET (30 seconds)**

This one is the easiest - we can generate it locally!

### **Instructions:**

1. Open a new terminal/command prompt
2. Run this command:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. You'll get output like: `abc123XYZ...` (a long random string)

4. **Copy this entire string**

5. Open `.env.local` in your editor

6. Find this line:
   ```env
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ```

7. Replace it with:
   ```env
   NEXTAUTH_SECRET=<paste your generated secret here>
   ```

8. Save the file

**✅ Done!** One down, three to go!

---

## 🤖 **Step 2: Get GEMINI_API_KEY (2 minutes)**

Google Gemini is used for AI image analysis.

### **Instructions:**

1. **Open this URL in your browser:**
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **Sign in** with your Google account (or create one if needed)

3. You'll see the "API keys" page

4. **Click the blue "Create API key" button**

5. A dialog will appear - **Click "Create API key in new project"**
   (Or select an existing project if you have one)

6. Your API key will be generated and displayed. It looks like:
   ```
   AIzaSyABC123...
   ```

7. **Click the "Copy" button** to copy it

8. **Keep this tab open** (you might need it again)

9. Go back to `.env.local` and find:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

10. Replace it with:
    ```env
    GEMINI_API_KEY=AIzaSyABC123...
    ```
    (paste your actual key)

11. Save the file

### **Important Notes:**
- ✅ **Free tier:** 1,500 requests per day (generous!)
- ✅ No credit card required for free tier
- ⚠️ Keep your API key secret - don't share it

**✅ Done!** Two down, two to go!

---

## 🔍 **Step 3: Get PERPLEXITY_API_KEY (3 minutes)** ⭐ CRITICAL

This is the **most important** one - it fixes Facebook Marketplace!

### **Instructions:**

1. **Open this URL in your browser:**
   ```
   https://www.perplexity.ai/settings/api
   ```

2. **You'll need to create an account:**
   - Click "Sign Up" (top right)
   - Choose sign up method:
     - Email & password, OR
     - Continue with Google, OR
     - Continue with Apple

3. **After signing in**, you'll be redirected to the API settings page
   - If not, go to: https://www.perplexity.ai/settings/api

4. **You should see "API Keys" section**

5. **Click "Generate API Key"**

6. **Give it a name** (e.g., "WIMSW Development")

7. Your API key will be shown. It looks like:
   ```
   pplx-abc123xyz...
   ```

8. **IMPORTANT: Copy it immediately!**
   - You won't be able to see it again
   - If you lose it, you'll need to generate a new one

9. **Keep this tab open** (to check usage later)

10. Go back to `.env.local` and find:
    ```env
    PERPLEXITY_API_KEY=your_perplexity_api_key_here
    ```

11. Replace it with:
    ```env
    PERPLEXITY_API_KEY=pplx-abc123xyz...
    ```
    (paste your actual key)

12. Save the file

### **Important Notes:**
- ✅ **Free tier:** $5 credit (about 1,000 requests)
- ⚠️ May require phone verification for free credit
- ⚠️ After free credit, you'll need to add payment (but free tier is generous)
- 💡 This is what makes Facebook Marketplace appear in results!

### **Troubleshooting:**

**Problem:** "API section not visible"
- **Solution:** Ensure you're fully signed up and email verified

**Problem:** "No free credit showing"
- **Solution:** Check if phone verification is required

**Problem:** Can't create account
- **Alternative:** We can modify the code to work with Gemini only (Facebook Marketplace may be inconsistent)

**✅ Done!** Three down, one to go!

---

## 🗄️ **Step 4: Get DATABASE_URL (5 minutes)**

You have two options: Vercel Postgres (recommended) or Local PostgreSQL.

### **Option A: Vercel Postgres (Recommended - Easy)**

1. **Open Vercel Dashboard:**
   ```
   https://vercel.com/darrinmc1s-projects/whatismystuffworth
   ```

2. **Click the "Storage" tab** at the top

3. **Click "Create Database"**

4. **Select "Postgres"**

5. Choose a region (pick closest to your users)

6. **Click "Create"**

7. **Wait for database to be created** (takes ~30 seconds)

8. Once created, **click on the database name**

9. **Click the "Connect" button** at the top right

10. You'll see several connection strings. Find:
    - **`POSTGRES_PRISMA_URL`** (this is your DATABASE_URL)
    - **`POSTGRES_URL_NON_POOLING`** (this is your DIRECT_URL)

11. **Click the copy button** next to each

12. Go to `.env.local` and add:
    ```env
    DATABASE_URL=postgres://...
    DIRECT_URL=postgres://...
    ```
    (paste the actual URLs)

13. Save the file

### **Important Notes:**
- ✅ **Free tier:** 60 compute hours/month, 256 MB storage
- ✅ Automatically configured for production deployment
- ✅ Backups included
- 💡 Same database used for local dev and production

**✅ Done!** All four critical variables complete!

---

### **Option B: Local PostgreSQL (Advanced)**

If you prefer local development database:

1. **Install PostgreSQL:**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt install postgresql`

2. **Start PostgreSQL service**

3. **Create database:**
   ```bash
   createdb wimsw
   ```

4. **Get connection string:**
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/wimsw
   DIRECT_URL=postgresql://postgres:password@localhost:5432/wimsw
   ```
   (Replace `password` with your PostgreSQL password)

5. Add to `.env.local`

**Note:** You'll still need Vercel Postgres for production deployment.

---

## ✅ **Final Step: Verify Everything**

1. **Check your `.env.local` file has all four variables:**
   ```env
   GEMINI_API_KEY=AIzaSy...
   PERPLEXITY_API_KEY=pplx-...
   NEXTAUTH_SECRET=abc123...
   DATABASE_URL=postgresql://...
   ```

2. **Run the diagnostic:**
   ```bash
   npx tsx scripts/check-env.ts
   ```

3. **You should see:**
   ```
   ✅ SET GEMINI_API_KEY
   ✅ SET PERPLEXITY_API_KEY
   ✅ SET NEXTAUTH_SECRET
   ✅ SET DATABASE_URL
   ```

4. **If all green, start the dev server:**
   ```bash
   npm install
   npm run db:push
   npm run dev
   ```

5. **Open http://localhost:3000**

6. **Test the app:**
   - Upload an item image
   - Click "Run Market Research"
   - **Verify Facebook Marketplace appears in results!**

---

## 🎉 **Success Checklist**

- [ ] Generated `NEXTAUTH_SECRET`
- [ ] Got `GEMINI_API_KEY` from Google
- [ ] Got `PERPLEXITY_API_KEY` from Perplexity
- [ ] Got `DATABASE_URL` from Vercel (or local PostgreSQL)
- [ ] All variables added to `.env.local`
- [ ] Ran `npx tsx scripts/check-env.ts` - all green ✅
- [ ] Ran `npm run dev` - server started
- [ ] Tested app - Facebook Marketplace appears

---

## 🆘 **Troubleshooting**

### Issue: "API key invalid" error

**For Gemini:**
- Go back to https://aistudio.google.com/app/apikey
- Verify the key is correct
- Check if API is enabled in Google Cloud Console

**For Perplexity:**
- Go to https://www.perplexity.ai/settings/api
- Check if key is active
- Verify you have free credit remaining

### Issue: Can't get Perplexity API key

**Workaround:** The app can work with just Gemini, but Facebook Marketplace may not appear consistently.

If you're stuck, let me know and I can help modify the code to work better with Gemini only.

### Issue: Database connection fails

**For Vercel Postgres:**
- Verify the connection string is correct
- Check if database is active in Vercel dashboard
- Try regenerating the connection strings

**For Local:**
- Ensure PostgreSQL service is running
- Verify username/password is correct
- Check port 5432 is not blocked

---

## 💰 **Cost Summary**

All services have generous free tiers:

| Service | Free Tier | When You Pay |
|---------|-----------|--------------|
| Gemini | 1,500 req/day | After limit |
| Perplexity | $5 credit | After credit used |
| Vercel Postgres | 60 hrs/month | After hours used |
| Total Monthly | **$0** | Only if you exceed free tiers |

**Estimated cost for personal/testing use:** $0-5/month

---

## 📞 **Need Help?**

If you get stuck on any step:

1. **Check the error message** in terminal
2. **Run diagnostic:** `npx tsx scripts/check-env.ts`
3. **Let me know which step you're stuck on** and I'll help debug!

---

**Ready to start?** Begin with Step 1 (NEXTAUTH_SECRET) above! 🚀
