/**
 * Migration script: Google Sheets → PostgreSQL
 *
 * Usage:
 *   npm run db:migrate-sheets
 *
 * This script:
 * 1. Reads all users from Google Sheets
 * 2. Migrates them to PostgreSQL
 * 3. Preserves all data (email, password, plan, role, timestamps)
 * 4. Handles duplicates gracefully with upsert
 */

import { prisma } from '../lib/prisma';
import * as sheetsDb from '../lib/google-sheets-db';

async function migrateUsers() {
  console.log('🚀 Starting migration from Google Sheets to PostgreSQL...\n');

  try {
    // Check if Postgres is configured
    if (!process.env.DATABASE_URL) {
      console.error('❌ ERROR: DATABASE_URL not found in environment variables');
      console.error('   Please add DATABASE_URL to your .env.local file');
      console.error('   See POSTGRES_MIGRATION.md for instructions');
      process.exit(1);
    }

    // Fetch all users from Google Sheets
    console.log('📊 Fetching users from Google Sheets...');
    const sheetsUsers = await sheetsDb.getAllUsers();
    console.log(`   Found ${sheetsUsers.length} users\n`);

    if (sheetsUsers.length === 0) {
      console.log('✅ No users to migrate. Done!');
      return;
    }

    // Migrate each user
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < sheetsUsers.length; i++) {
      const user = sheetsUsers[i];
      const progress = `[${i + 1}/${sheetsUsers.length}]`;

      try {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existing) {
          console.log(`${progress} ⏭️  Skipping ${user.email} (already exists)`);
          skippedCount++;
          continue;
        }

        // Migrate user
        await prisma.user.create({
          data: {
            email: user.email.toLowerCase(),
            password: user.password,
            name: user.name || null,
            plan: user.plan.toUpperCase() as any,
            role: user.role.toUpperCase() as any,
            createdAt: new Date(user.createdAt),
            lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
          },
        });

        console.log(`${progress} ✅ Migrated ${user.email}`);
        successCount++;
      } catch (error) {
        console.error(`${progress} ❌ Error migrating ${user.email}:`, error);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📈 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ⏭️  Skipped (already exist): ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n💡 Next steps:');
      console.log('   1. Verify data: npm run db:studio');
      console.log('   2. Test authentication with migrated users');
      console.log('   3. Consider removing Google Sheets credentials');
    } else {
      console.log('\n⚠️  Migration completed with errors. Please review above.');
    }
  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});

// Run migration
migrateUsers();
