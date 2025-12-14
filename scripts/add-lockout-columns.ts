import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';
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

async function addLockoutColumns() {
  console.log('Adding lockout columns to Users sheet...');

  // Update headers (I and J columns)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Users!I1:J1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['FailedAttempts', 'LockedUntil']],
    },
  });

  // Initialize existing user rows with default values (0 failed attempts, no lockout)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Users!A:H',
  });

  const rows = response.data.values;
  if (rows && rows.length > 1) {
    // For each user row (skip header)
    for (let i = 1; i < rows.length; i++) {
      const rowNumber = i + 1;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Users!I${rowNumber}:J${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['0', '']], // 0 failed attempts, no lockout
        },
      });
    }
    console.log(`✓ Initialized ${rows.length - 1} user rows with default lockout values`);
  }

  console.log('\n✅ Lockout columns added successfully!');
  console.log('   Column I: FailedAttempts');
  console.log('   Column J: LockedUntil\n');
}

addLockoutColumns().catch(console.error);
