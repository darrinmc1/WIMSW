import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';
import { google } from 'googleapis';

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

async function setUserPin(email: string, pin: string) {
  // Validate PIN
  if (!/^\d{4}$/.test(pin)) {
    console.error('❌ PIN must be exactly 4 digits');
    process.exit(1);
  }

  console.log(`Looking for user: ${email}...`);

  // Get all users
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Users!A:J',
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) {
    console.error('❌ No users found');
    return;
  }

  // Find user row
  let rowNumber = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1]?.toLowerCase() === email.toLowerCase()) {
      rowNumber = i + 1; // Sheets is 1-indexed
      break;
    }
  }

  if (rowNumber === -1) {
    console.error(`❌ User not found: ${email}`);
    return;
  }

  console.log(`✓ Found user at row ${rowNumber}`);

  // Hash the PIN
  const hashedPin = await bcrypt.hash(pin, 10);
  console.log('✓ PIN hashed');

  // Update PIN (password column) and reset lockout fields
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Users!C${rowNumber}:C${rowNumber}`, // PIN column
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[hashedPin]],
    },
  });

  // Reset failed attempts and lockout
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Users!I${rowNumber}:J${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['0', '']], // Reset attempts and clear lockout
    },
  });

  console.log('\n✅ PIN updated successfully!');
  console.log(`   Email: ${email}`);
  console.log(`   New PIN: ${pin}`);
  console.log(`   Failed attempts: Reset to 0`);
  console.log(`   Lockout: Cleared`);
  console.log('\n🔑 You can now login with the new PIN!');
  console.log(`   Login URL: http://localhost:3000/login\n`);
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: npx tsx scripts/set-pin.ts <email> <4-digit-pin>');
  console.error('Example: npx tsx scripts/set-pin.ts user@example.com 1234');
  process.exit(1);
}

const [email, pin] = args;
setUserPin(email, pin).catch(console.error);
