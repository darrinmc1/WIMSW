/**
 * Environment Variable Diagnostic Script
 * Run this to check which environment variables are configured
 *
 * Usage:
 *   npx tsx scripts/check-env.ts
 */

console.log("🔍 Checking Environment Variables...\n");

const requiredVars = [
  { name: "GEMINI_API_KEY", description: "Google Gemini API (for item analysis)", critical: true },
  { name: "PERPLEXITY_API_KEY", description: "Perplexity API (for market research & Facebook Marketplace)", critical: true },
  { name: "NEXTAUTH_SECRET", description: "NextAuth.js secret (for authentication)", critical: true },
  { name: "DATABASE_URL", description: "PostgreSQL connection string", critical: true },
  { name: "DIRECT_URL", description: "Direct database connection", critical: false },
  { name: "NEXTAUTH_URL", description: "NextAuth URL (production deployment URL)", critical: false },
];

const optionalVars = [
  { name: "UPSTASH_REDIS_REST_URL", description: "Upstash Redis URL (for rate limiting)" },
  { name: "UPSTASH_REDIS_REST_TOKEN", description: "Upstash Redis token" },
  { name: "SENTRY_DSN", description: "Sentry error tracking" },
  { name: "NEXT_PUBLIC_SENTRY_DSN", description: "Sentry client-side DSN" },
];

const legacyVars = [
  { name: "GOOGLE_SHEET_ID", description: "Google Sheets ID (legacy - being migrated to PostgreSQL)" },
  { name: "GOOGLE_CLIENT_EMAIL", description: "Google service account email (legacy)" },
  { name: "GOOGLE_PRIVATE_KEY", description: "Google private key (legacy)" },
];

let hasErrors = false;
let hasCriticalMissing = false;

console.log("📋 REQUIRED VARIABLES:\n");
requiredVars.forEach(({ name, description, critical }) => {
  const value = process.env[name];
  const status = value ? "✅ SET" : (critical ? "❌ MISSING" : "⚠️  MISSING");
  const preview = value ? `(${value.substring(0, 20)}...)` : "";

  console.log(`${status} ${name}`);
  console.log(`   ${description}`);
  if (value) {
    console.log(`   Value: ${preview}`);
  } else {
    if (critical) {
      hasCriticalMissing = true;
      console.log(`   ⚠️  CRITICAL: App will not work without this!`);
    }
  }
  console.log();
});

console.log("\n📦 OPTIONAL VARIABLES:\n");
optionalVars.forEach(({ name, description }) => {
  const value = process.env[name];
  const status = value ? "✅ SET" : "⚪ NOT SET";
  console.log(`${status} ${name} - ${description}`);
});

console.log("\n🗄️  LEGACY VARIABLES (can be removed after PostgreSQL migration):\n");
legacyVars.forEach(({ name, description }) => {
  const value = process.env[name];
  const status = value ? "✅ SET" : "⚪ NOT SET";
  console.log(`${status} ${name} - ${description}`);
});

console.log("\n" + "=".repeat(60));
if (hasCriticalMissing) {
  console.log("\n❌ CRITICAL ERRORS FOUND!");
  console.log("\nYour app WILL NOT WORK without the missing critical variables.");
  console.log("\nTo fix this:");
  console.log("1. Create a .env.local file in the root directory");
  console.log("2. Copy from .env.example and fill in your API keys");
  console.log("3. For Vercel deployment, add these in:");
  console.log("   https://vercel.com/darrinmc1s-projects/whatismystuffworth/settings/environment-variables");
  process.exit(1);
} else {
  console.log("\n✅ All critical environment variables are set!");
  console.log("\n💡 To get PERPLEXITY_API_KEY:");
  console.log("   1. Go to https://www.perplexity.ai/settings/api");
  console.log("   2. Create an API key");
  console.log("   3. Add to Vercel: Settings → Environment Variables");
  console.log("   4. Redeploy your app");
}

console.log("\n" + "=".repeat(60));
