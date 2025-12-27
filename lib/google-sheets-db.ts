// This file is skipped if Google Sheets is not configured
// Export empty stubs so imports don't break
export type UserPlan = 'FREE' | 'PREMIUM' | 'ENTERPRISE';
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  plan: UserPlan;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  failedAttempts?: number;
  lockedUntil?: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return null;
}

export async function saveResetToken(email: string, token: string, expiresAt: string): Promise<boolean> {
  return false;
}

export async function verifyResetToken(email: string, token: string): Promise<boolean> {
  return false;
}

export async function createUser(email: string, hashedPassword: string, name?: string): Promise<User | null> {
  return null;
}

export async function updateLastLogin(email: string): Promise<void> {
  // No-op
}

export async function updatePassword(email: string, newHash: string): Promise<boolean> {
  return false;
}

export async function getAllUsers(): Promise<User[]> {
  return [];
}

export async function incrementFailedAttempts(email: string): Promise<{ isLocked: boolean; attemptsLeft: number }> {
  return { isLocked: false, attemptsLeft: 5 };
}

export async function resetFailedAttempts(email: string): Promise<void> {
  // No-op
}

export function isUserLocked(user: User): boolean {
  return false;
}

export async function initializeUsersSheet(): Promise<void> {
  // No-op
}

export async function saveResearchHistory(
  userId: string,
  itemDetails: any,
  results: any,
  isLocalOnly?: boolean
): Promise<void> {
  // No-op
}

export async function getResearchHistory(userId: string, limit?: number): Promise<any[]> {
  return [];
}
