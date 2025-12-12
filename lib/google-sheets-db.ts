import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEET_ID!

export type UserPlan = 'free' | 'premium' | 'enterprise';
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name?: string;
  plan: UserPlan;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

/**
 * Get user by email from Google Sheets
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:H', // Columns: ID, Email, Password, Name, Plan, CreatedAt, LastLogin, Role
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null; // No data or only headers

    // Skip header row and find user
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1]?.toLowerCase() === email.toLowerCase()) {
        const plan = row[4] as UserPlan;
        const role = row[7] as UserRole;
        return {
          id: row[0],
          email: row[1],
          password: row[2],
          name: row[3],
          plan: plan && ['free', 'premium', 'enterprise'].includes(plan) ? plan : 'free',
          createdAt: row[5],
          lastLogin: row[6],
          role: role && ['user', 'admin'].includes(role) ? role : 'user',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Create a new user in Google Sheets
 */
export async function createUser(email: string, hashedPassword: string, name?: string): Promise<User | null> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Users!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          id,
          email,
          hashedPassword,
          name || '',
          'free', // default plan
          createdAt,
          '', // lastLogin (empty initially)
          'user', // default role
        ]],
      },
    });

    return {
      id,
      email,
      password: hashedPassword,
      name,
      plan: 'free',
      role: 'user',
      createdAt,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Update user's last login time
 */
export async function updateLastLogin(email: string): Promise<void> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:G',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return;

    // Find user row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1]?.toLowerCase() === email.toLowerCase()) {
        const rowNumber = i + 1; // Sheets rows are 1-indexed
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Users!G${rowNumber}`, // LastLogin column
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[new Date().toISOString()]],
          },
        });
        break;
      }
    }
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

/**
 * Update user password
 */
export async function updatePassword(email: string, newHash: string): Promise<boolean> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:G', // Need email column
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return false;

    // Find user row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1]?.toLowerCase() === email.toLowerCase()) {
        const rowNumber = i + 1;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Users!C${rowNumber}`, // Password column is C (index 2)
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[newHash]],
          },
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}

/**
 * Get all users from Google Sheets
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:H', // Updated range to include Role
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    // Skip header row
    return rows.slice(1).map(row => {
      const plan = row[4] as UserPlan;
      const role = row[7] as UserRole;
      return {
        id: row[0],
        email: row[1],
        password: row[2], // In a real app, maybe don't return this
        name: row[3],
        plan: plan && ['free', 'premium', 'enterprise'].includes(plan) ? plan : 'free',
        createdAt: row[5],
        lastLogin: row[6],
        role: role && ['user', 'admin'].includes(role) ? role : 'user',
      };
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

/**
 * Initialize the Users sheet with headers if it doesn't exist
 */
export async function initializeUsersSheet(): Promise<void> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A1:G1',
    });

    // If no data, add headers
    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Users!A1:G1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['ID', 'Email', 'Password', 'Name', 'Plan', 'Created At', 'Last Login', 'Role']],
        },
      });
    } else if (response.data.values && response.data.values[0].length < 8) {
      // Append Role header if it's missing (for existing sheets)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Users!H1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Role']],
        },
      });
    }
  } catch (error) {
    // Sheet might not exist, try to create it
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Users',
              },
            },
          }],
        },
      });

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Users!A1:G1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['ID', 'Email', 'Password', 'Name', 'Plan', 'Created At', 'Last Login', 'Role']],
        },
      });
    } catch (createError) {
      console.error('Error initializing Users sheet:', createError);
    }
  }
}
