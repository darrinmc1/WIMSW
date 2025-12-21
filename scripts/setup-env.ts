/**
 * Interactive Environment Setup Helper
 *
 * This script helps you set up your environment variables step by step.
 * Run: npx tsx scripts/setup-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

console.log("🚀 WIMSW.com Environment Setup Helper\n");
console.log("This will help you configure your .env.local file.\n");

async function main() {
  const envPath = path.join(process.cwd(), '.env.local');
  const examplePath = path.join(process.cwd(), '.env.example');

  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env.local already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('\n✅ Keeping existing .env.local file.');
      console.log('💡 Edit it manually or delete it and run this script again.\n');
      rl.close();
      return;
    }
  }

  console.log("\n📋 Let's set up your environment variables.\n");
  console.log("You can skip any by pressing Enter (you can add them later)\n");
  console.log("=".repeat(60) + "\n");

  // Collect variables
  const vars: Record<string, string> = {};

  // GEMINI_API_KEY
  console.log("1️⃣  GEMINI_API_KEY (Google Gemini AI)");
  console.log("   Purpose: Analyzes uploaded images to identify items");
  console.log("   Get it from: https://aistudio.google.com/app/apikey\n");
  vars.GEMINI_API_KEY = await question("   Enter your Gemini API key (or skip): ");

  // PERPLEXITY_API_KEY
  console.log("\n2️⃣  PERPLEXITY_API_KEY (Perplexity AI) ⭐ CRITICAL");
  console.log("   Purpose: Real-time market research (Facebook Marketplace, eBay, etc.)");
  console.log("   Get it from: https://www.perplexity.ai/settings/api\n");
  vars.PERPLEXITY_API_KEY = await question("   Enter your Perplexity API key (or skip): ");

  // DATABASE_URL
  console.log("\n3️⃣  DATABASE_URL (PostgreSQL)");
  console.log("   Purpose: Stores user data and research history");
  console.log("   Format: postgresql://user:password@host:5432/database\n");
  vars.DATABASE_URL = await question("   Enter your DATABASE_URL (or skip): ");

  if (vars.DATABASE_URL) {
    console.log("\n4️⃣  DIRECT_URL (Direct PostgreSQL connection)");
    console.log("   Usually same as DATABASE_URL but with ?sslmode=require\n");
    vars.DIRECT_URL = await question("   Enter your DIRECT_URL (or skip): ");
  }

  // NEXTAUTH_SECRET
  console.log("\n5️⃣  NEXTAUTH_SECRET");
  console.log("   Purpose: Secures user authentication");
  const generateSecret = await question("   Generate random secret automatically? (Y/n): ");

  if (generateSecret.toLowerCase() !== 'n') {
    const crypto = await import('crypto');
    vars.NEXTAUTH_SECRET = crypto.randomBytes(32).toString('base64');
    console.log("   ✅ Generated: " + vars.NEXTAUTH_SECRET);
  } else {
    vars.NEXTAUTH_SECRET = await question("   Enter your NEXTAUTH_SECRET: ");
  }

  // NEXTAUTH_URL
  console.log("\n6️⃣  NEXTAUTH_URL");
  console.log("   For local dev: http://localhost:3000");
  console.log("   For production: https://your-domain.vercel.app\n");
  const useDefault = await question("   Use default (http://localhost:3000)? (Y/n): ");
  vars.NEXTAUTH_URL = useDefault.toLowerCase() === 'n'
    ? await question("   Enter your NEXTAUTH_URL: ")
    : "http://localhost:3000";

  // Optional: Upstash Redis
  console.log("\n7️⃣  UPSTASH_REDIS (Optional - for rate limiting)");
  const addRedis = await question("   Add Upstash Redis? (y/N): ");
  if (addRedis.toLowerCase() === 'y') {
    console.log("   Get free tier at: https://upstash.com/\n");
    vars.UPSTASH_REDIS_REST_URL = await question("   UPSTASH_REDIS_REST_URL: ");
    vars.UPSTASH_REDIS_REST_TOKEN = await question("   UPSTASH_REDIS_REST_TOKEN: ");
  }

  // Generate .env.local content
  let envContent = `# =====================================================
# WIMSW.com Environment Variables
# Generated: ${new Date().toISOString()}
# =====================================================
# NEVER commit this file to Git (it's in .gitignore)
# =====================================================

`;

  // Add critical variables
  envContent += "# =====================================================\n";
  envContent += "# CRITICAL VARIABLES\n";
  envContent += "# =====================================================\n\n";

  if (vars.GEMINI_API_KEY) {
    envContent += `GEMINI_API_KEY=${vars.GEMINI_API_KEY}\n`;
  } else {
    envContent += `# GEMINI_API_KEY=your_gemini_api_key_here\n`;
  }

  if (vars.PERPLEXITY_API_KEY) {
    envContent += `PERPLEXITY_API_KEY=${vars.PERPLEXITY_API_KEY}\n`;
  } else {
    envContent += `# PERPLEXITY_API_KEY=your_perplexity_api_key_here\n`;
  }

  envContent += "\n";

  if (vars.DATABASE_URL) {
    envContent += `DATABASE_URL=${vars.DATABASE_URL}\n`;
  } else {
    envContent += `# DATABASE_URL=your_database_url_here\n`;
  }

  if (vars.DIRECT_URL) {
    envContent += `DIRECT_URL=${vars.DIRECT_URL}\n`;
  } else {
    envContent += `# DIRECT_URL=your_direct_database_url_here\n`;
  }

  envContent += "\n";

  if (vars.NEXTAUTH_SECRET) {
    envContent += `NEXTAUTH_SECRET=${vars.NEXTAUTH_SECRET}\n`;
  }

  if (vars.NEXTAUTH_URL) {
    envContent += `NEXTAUTH_URL=${vars.NEXTAUTH_URL}\n`;
  }

  envContent += "\n";

  // Add optional variables
  if (vars.UPSTASH_REDIS_REST_URL || vars.UPSTASH_REDIS_REST_TOKEN) {
    envContent += "# =====================================================\n";
    envContent += "# OPTIONAL VARIABLES\n";
    envContent += "# =====================================================\n\n";

    if (vars.UPSTASH_REDIS_REST_URL) {
      envContent += `UPSTASH_REDIS_REST_URL=${vars.UPSTASH_REDIS_REST_URL}\n`;
    }
    if (vars.UPSTASH_REDIS_REST_TOKEN) {
      envContent += `UPSTASH_REDIS_REST_TOKEN=${vars.UPSTASH_REDIS_REST_TOKEN}\n`;
    }
    envContent += "\n";
  }

  envContent += "# =====================================================\n";
  envContent += "# DEVELOPMENT SETTINGS\n";
  envContent += "# =====================================================\n";
  envContent += "NODE_ENV=development\n";

  // Write file
  fs.writeFileSync(envPath, envContent);

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ .env.local file created successfully!\n");

  // Check what's missing
  const missing = [];
  if (!vars.GEMINI_API_KEY) missing.push("GEMINI_API_KEY");
  if (!vars.PERPLEXITY_API_KEY) missing.push("PERPLEXITY_API_KEY");
  if (!vars.DATABASE_URL) missing.push("DATABASE_URL");

  if (missing.length > 0) {
    console.log("⚠️  You still need to add these variables:");
    missing.forEach(v => console.log(`   - ${v}`));
    console.log("\nEdit .env.local and add them, then restart your dev server.\n");
  } else {
    console.log("🎉 All critical variables are set!\n");
  }

  console.log("📝 Next steps:");
  console.log("   1. Verify the values in .env.local");
  console.log("   2. Run: npm run dev");
  console.log("   3. Test the app at http://localhost:3000\n");

  console.log("💡 For Vercel deployment:");
  console.log("   Add the same variables to:");
  console.log("   https://vercel.com/darrinmc1s-projects/whatismystuffworth/settings/environment-variables\n");

  console.log("=".repeat(60) + "\n");

  rl.close();
}

main().catch((error) => {
  console.error("Error:", error);
  rl.close();
  process.exit(1);
});
