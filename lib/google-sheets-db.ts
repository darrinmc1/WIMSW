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

export type UserPlan = 'FREE' | 'PREMIUM' | 'ENTERPRISE';
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  password: string; // hashed (will be PIN hash)
  name?: string;
  plan: UserPlan;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  failedAttempts?: number;
  lockedUntil?: string;
}

// Simple in-memory cache
let userCache: Map<string, User> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds cache TTL (short enough for updates, long enough for bursts)

/**
 * Get user by email from Google Sheets (with caching)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const now = Date.now();

    // Refresh cache if null or expired
    if (!userCache || (now - cacheTimestamp > CACHE_TTL)) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Users!A:J', // Extended to column J for lockout fields
      });

      const rows = response.data.values;
      const newCache = new Map<string, User>();

      if (rows && rows.length > 1) {
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row[1]) { // Ensure email exists
            const plan = row[4] as UserPlan;
            const role = row[7] as UserRole;
            const user: User = {
              id: row[0],
              email: row[1],
              password: row[2],
              name: row[3],
              plan: (plan?.toUpperCase() === 'PREMIUM' ? 'PREMIUM' : plan?.toUpperCase() === 'ENTERPRISE' ? 'ENTERPRISE' : 'FREE') as UserPlan,
              createdAt: row[5],
              lastLogin: row[6],
              role: (role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER') as UserRole,
              failedAttempts: row[8] ? parseInt(row[8]) : 0,
              lockedUntil: row[9] || undefined,
            };
            newCache.set(row[1].toLowerCase(), user);
          }
        }
      }
      userCache = newCache;
      cacheTimestamp = now;
    }

    return userCache?.get(email.toLowerCase()) || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Save password reset token
 */
export async function saveResetToken(email: string, token: string, expiresAt: string): Promise<boolean> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:J',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return false;

    // Find user row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1]?.toLowerCase() === email.toLowerCase()) {
        const rowNumber = i + 1;
        // Update Reset Token (Col K) and Expires (Col L)
        // Note: Google Sheets API handles expanding the range automatically if we write past current bounds
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Users!K${rowNumber}:L${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[token, expiresAt]],
          },
        });
        userCache = null; // Invalidate cache
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error saving reset token:', error);
    return false;
  }
}

/**
 * Verify and consume reset token
 * Returns true if valid, false otherwise
 */
export async function verifyResetToken(email: string, token: string): Promise<boolean> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:L', // Check up to Col L
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return false;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1]?.toLowerCase() === email.toLowerCase()) {
        const storedToken = row[10]; // Col K (index 10)
        const storedExpires = row[11]; // Col L (index 11)

        if (storedToken === token) {
          // Check expiry
          if (new Date(storedExpires) > new Date()) {
            // Token valid. In a real app we might consume it immediately or wait for password reset.
            // For PIN login flow, "verifying" usually means "logging in with PIN".
            return true;
          }
        }
        break;
      }
    }
    return false;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
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
          'FREE', // default plan
          createdAt,
          '', // lastLogin (empty initially)
          'USER', // default role
        ]],
      },
    });

    // Invalidate cache
    userCache = null;

    return {
      id,
      email,
      password: hashedPassword,
      name,
      plan: 'FREE',
      role: 'USER',
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
        // Invalidate cache
        userCache = null;
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
        // Invalidate cache
        userCache = null;
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
        plan: (plan?.toUpperCase() === 'PREMIUM' ? 'PREMIUM' : plan?.toUpperCase() === 'ENTERPRISE' ? 'ENTERPRISE' : 'FREE') as UserPlan,
        createdAt: row[5],
        lastLogin: row[6],
        role: (role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER') as UserRole,
      };
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

/**
 * Increment failed login attempts and lock account if needed
 */
export async function incrementFailedAttempts(email: string): Promise<{ isLocked: boolean; attemptsLeft: number }> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:J',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return { isLocked: false, attemptsLeft: 5 };

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1]?.toLowerCase() === email.toLowerCase()) {
        const rowNumber = i + 1;
        const currentAttempts = row[8] ? parseInt(row[8]) : 0;
        const newAttempts = currentAttempts + 1;

        // Lock if 5 or more attempts
        if (newAttempts >= 5) {
          const lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // Lock for 15 minutes
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Users!I${rowNumber}:J${rowNumber}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[newAttempts.toString(), lockUntil]],
            },
          });
          userCache = null;
          return { isLocked: true, attemptsLeft: 0 };
        }

        // Update failed attempts
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Users!I${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[newAttempts.toString()]],
          },
        });
        userCache = null;
        return { isLocked: false, attemptsLeft: 5 - newAttempts };
      }
    }
    return { isLocked: false, attemptsLeft: 5 };
  } catch (error) {
    console.error('Error incrementing failed attempts:', error);
    return { isLocked: false, attemptsLeft: 5 };
  }
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedAttempts(email: string): Promise<void> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:J',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1]?.toLowerCase() === email.toLowerCase()) {
        const rowNumber = i + 1;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Users!I${rowNumber}:J${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['0', '']], // Reset attempts and clear lockout
          },
        });
        userCache = null;
        break;
      }
    }
  } catch (error) {
    console.error('Error resetting failed attempts:', error);
  }
}

/**
 * Check if user is locked out
 */
export function isUserLocked(user: User): boolean {
  if (!user.lockedUntil) return false;
  const lockTime = new Date(user.lockedUntil).getTime();
  const now = Date.now();
  return now < lockTime;
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
        range: 'Users!A1:L1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['ID', 'Email', 'Password', 'Name', 'Plan', 'Created At', 'Last Login', 'Role', 'Failures', 'Locked Until', 'Reset Token', 'Reset Expires']],
        },
      });
    } catch (createError) {
      console.error('Error initializing Users sheet:', createError);
    }
  }
}
