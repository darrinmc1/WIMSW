/**
 * Script to reset a user's password in Google Sheets
 * Usage: npx tsx scripts/reset-password.ts <email> <new-password>
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { google } from 'googleapis';
import bcrypt from 'bcryptjs';

// Load .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') });

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

async function resetPassword() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/reset-password.ts <email> <new-password>');
    console.error('Example: npx tsx scripts/reset-password.ts admin@example.com newpassword123');
    process.exit(1);
  }

  const [email, newPassword] = args;

  try {
    // Check Google Sheets credentials
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      console.error('❌ Google Sheets credentials not found in .env.local');
      process.exit(1);
    }

    console.log(`Looking for user: ${email}...`);

    // Get existing users
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:H',
    });

    const rows = response.data.values || [[]];
    const emailLower = email.toLowerCase();

    // Find user row
    let userRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1]?.toLowerCase() === emailLower) {
        userRowIndex = i;
        break;
      }
    }

    if (userRowIndex === -1) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✓ Found user at row ${userRowIndex + 1}`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✓ Password hashed');

    // Update password in column C
    const rowNumber = userRowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Users!C${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[hashedPassword]],
      },
    });

    console.log('\n✅ Password updated successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   New password: ${newPassword}`);
    console.log('\n🔑 You can now login with the new password!');
    console.log(`   Login URL: http://localhost:3000/login`);
  } catch (error: any) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  }
}

resetPassword();
