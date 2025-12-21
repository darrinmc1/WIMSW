# 🚀 Quick Start Guide - WIMSW.com

Get your local development environment running in 5 minutes!

---

## ⚡ Super Quick Setup (TL;DR)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (interactive)
npx tsx scripts/setup-env.ts

# 3. Set up database
npm run db:generate
npm run db:push

# 4. Start development server
npm run dev
```

Open http://localhost:3000 🎉

---

## 📋 Detailed Setup

### Step 1: Install Dependencies

```bash
npm install
```

**What this does:** Installs Next.js, React, Prisma, and all required packages.

---

### Step 2: Set Up Environment Variables

You have **3 options**:

#### **Option A: Interactive Setup (Recommended)**
```bash
npx tsx scripts/setup-env.ts
```
Follow the prompts to add your API keys.

#### **Option B: Manual Setup**
1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
   (Windows: `copy .env.example .env.local`)

2. Edit `.env.local` and add your API keys:
   ```env
   GEMINI_API_KEY=your_key_here
   PERPLEXITY_API_KEY=your_key_here
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your_secret_here
   ```

#### **Option C: Use the pre-created template**
A `.env.local` file has been created with placeholders. Edit it and replace the values.

---

### Step 3: Get Your API Keys

#### 🔑 **GEMINI_API_KEY** (Required)
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy and paste into `.env.local`

**Free tier:** 1,500 requests/day

#### 🔑 **PERPLEXITY_API_KEY** (Required - Critical for Facebook Marketplace)
1. Go to: https://www.perplexity.ai/settings/api
2. Sign up (free tier available)
3. Generate API key
4. Copy and paste into `.env.local`

**Free tier:** $5 credit (~1,000 requests)

#### 🔑 **DATABASE_URL** (Required)

**Option A: Use Vercel Postgres (Recommended)**
1. Go to: https://vercel.com/darrinmc1s-projects/whatismystuffworth
2. Click "Storage" tab → "Create Database" → "Postgres"
3. Once created, copy the `DATABASE_URL`
4. Also copy `POSTGRES_URL_NON_POOLING` as `DIRECT_URL`

**Option B: Use Local PostgreSQL**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/wimsw
DIRECT_URL=postgresql://postgres:password@localhost:5432/wimsw
```

**Free tier (Vercel):** 60 compute hours/month, 256 MB storage

#### 🔑 **NEXTAUTH_SECRET** (Required)

Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy the output to `.env.local`

---

### Step 4: Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

**Optional:** Create an admin user
```bash
npx tsx scripts/create-admin.ts
```

---

### Step 5: Verify Setup

Check that all required variables are configured:
```bash
npx tsx scripts/check-env.ts
```

You should see:
```
✅ All critical environment variables are set!
```

---

### Step 6: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser! 🎉

---

## 🧪 Test the App

1. **Upload an image** of clothing/item
2. Click "✨ Identify Item"
3. Review the analysis
4. Click "Run Market Research"
5. **Verify Facebook Marketplace appears** in results

---

## ⚠️ Troubleshooting

### "PERPLEXITY_API_KEY is required" error

**Cause:** Missing API key in `.env.local`

**Fix:**
1. Check `.env.local` has `PERPLEXITY_API_KEY=...`
2. Ensure there are no spaces before/after the `=`
3. Restart dev server: `npm run dev`

### Facebook Marketplace not appearing

**Cause:** Perplexity API key missing or invalid

**Fix:**
1. Verify key in `.env.local`
2. Check Perplexity dashboard for usage/errors
3. Try regenerating the API key

### Database connection errors

**Cause:** Invalid `DATABASE_URL`

**Fix:**
1. Verify the connection string is correct
2. Test connection: `npm run db:studio`
3. If using Vercel Postgres, ensure you copied the full URL

### "Module not found" errors

**Cause:** Dependencies not installed

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🚀 Deploy to Vercel

### Prerequisites
- All API keys from setup
- GitHub repository connected to Vercel

### Steps

1. **Add environment variables to Vercel:**
   - Go to: https://vercel.com/darrinmc1s-projects/whatismystuffworth/settings/environment-variables
   - Add all variables from your `.env.local`
   - Select: Production, Preview, Development

2. **Trigger deployment:**
   - Push to GitHub, or
   - Click "Redeploy" in Vercel dashboard

3. **Run database migrations:**
   ```bash
   npm run db:migrate:deploy
   ```

4. **Verify deployment:**
   - Visit your app URL
   - Test image upload → market research
   - Check Facebook Marketplace appears

**See full guide:** [VERCEL_SETUP_GUIDE.md](VERCEL_SETUP_GUIDE.md)

---

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create migration |
| `npm run db:studio` | Open Prisma Studio |
| `npx tsx scripts/check-env.ts` | Check environment variables |
| `npx tsx scripts/setup-env.ts` | Interactive env setup |

---

## 🆘 Get Help

- **Environment issues:** Run `npx tsx scripts/check-env.ts`
- **Vercel setup:** See [VERCEL_SETUP_GUIDE.md](VERCEL_SETUP_GUIDE.md)
- **App review:** See main review doc
- **GitHub Issues:** https://github.com/darrinmc1/WIMSW/issues

---

## 💡 Tips

- **Free tiers:** All recommended services have generous free tiers
- **Local development:** Works without Upstash Redis (uses in-memory rate limiting)
- **Testing:** Use `npm run test` to run unit tests
- **Database GUI:** Use `npm run db:studio` to browse data
- **API monitoring:** Add Sentry for error tracking in production

---

**Estimated setup time:** 5-10 minutes

**Need help?** Open an issue or check the troubleshooting section above.

Happy coding! 🚀
