/**
 * Script to create an admin user in Google Sheets
 * Usage: npx tsx scripts/create-admin-sheets.ts <email> <password> <name>
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

async function createAdminUser() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: npx tsx scripts/create-admin-sheets.ts <email> <password> <name>');
    console.error('Example: npx tsx scripts/create-admin-sheets.ts admin@example.com mypassword "Admin User"');
    process.exit(1);
  }

  const [email, password, name] = args;

  try {
    // Check Google Sheets credentials
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      console.error('❌ Google Sheets credentials not found in .env.local');
      console.error('Please set: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID');
      process.exit(1);
    }

    // Get existing users
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:H', // Columns: ID, Email, Password, Name, Plan, CreatedAt, LastLogin, Role
    });

    const rows = response.data.values || [[]];
    const emailLower = email.toLowerCase();

    // Check if user exists
    let userRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1]?.toLowerCase() === emailLower) {
        userRowIndex = i;
        break;
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (userRowIndex !== -1) {
      // Update existing user to admin
      const rowNumber = userRowIndex + 1; // +1 because spreadsheet rows are 1-indexed
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Users!D${rowNumber}:H${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[name, 'free', new Date().toISOString(), '', 'admin']],
        },
      });

      console.log('✅ User updated to ADMIN role:');
      console.log(`   Email: ${email}`);
      console.log(`   Name: ${name}`);
      console.log(`   Role: admin`);
    } else {
      // Create new admin user
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const createdAt = new Date().toISOString();

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Users!A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            id,
            emailLower,
            hashedPassword,
            name,
            'free', // plan
            createdAt, // createdAt
            '', // lastLogin (empty)
            'admin', // role
          ]],
        },
      });

      console.log('✅ Admin user created successfully:');
      console.log(`   Email: ${emailLower}`);
      console.log(`   Name: ${name}`);
      console.log(`   Role: admin`);
      console.log(`   Plan: free`);
    }

    console.log('\n🔑 You can now login with these credentials!');
    console.log(`   Login URL: http://localhost:3000/login`);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.message.includes('Unable to parse range')) {
      console.error('\nMake sure your Google Sheet has a "Users" sheet with columns:');
      console.error('A: ID | B: Email | C: Password | D: Name | E: Plan | F: CreatedAt | G: LastLogin | H: Role');
    }
    process.exit(1);
  }
}

createAdminUser();
