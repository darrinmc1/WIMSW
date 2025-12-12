/**
 * Script to create an admin user
 * Usage: npx tsx scripts/create-admin.ts <email> <password> <name>
 */

import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole, UserPlan } from '@prisma/client';

async function createAdminUser() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> <password> <name>');
    console.error('Example: npx tsx scripts/create-admin.ts admin@example.com mypassword "Admin User"');
    process.exit(1);
  }

  const [email, password, name] = args;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log(`User with email ${email} already exists.`);

      // Update to admin role
      const updated = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
          role: UserRole.ADMIN,
          name: name,
        },
      });

      console.log('✅ User updated to ADMIN role:');
      console.log(`   Email: ${updated.email}`);
      console.log(`   Name: ${updated.name}`);
      console.log(`   Role: ${updated.role}`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name,
        role: UserRole.ADMIN,
        plan: UserPlan.FREE,
      },
    });

    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Plan: ${user.plan}`);
    console.log('\n🔑 You can now login with these credentials!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
