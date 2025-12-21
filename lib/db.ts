/**
 * Database abstraction layer
 * Supports both Google Sheets (legacy) and Postgres (new)
 * Use DATABASE_URL env var to enable Postgres
 */

import { prisma } from './prisma';
import * as sheetsDb from './google-sheets-db';
import type { User, UserPlan, UserRole } from '@prisma/client';

// Check if Postgres is configured
const USE_POSTGRES = !!process.env.DATABASE_URL;

console.log(`📊 Database mode: ${USE_POSTGRES ? 'PostgreSQL' : 'Google Sheets (legacy)'}`);

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (USE_POSTGRES) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  // Fallback to Google Sheets
  const sheetsUser = await sheetsDb.getUserByEmail(email);
  if (!sheetsUser) return null;

  // Convert sheets user to Prisma-compatible format
  return {
    id: sheetsUser.id,
    email: sheetsUser.email,
    password: sheetsUser.password,
    name: sheetsUser.name ?? null,
    plan: sheetsUser.plan.toUpperCase() as UserPlan,
    role: sheetsUser.role.toUpperCase() as UserRole,
    createdAt: new Date(sheetsUser.createdAt),
    updatedAt: new Date(sheetsUser.createdAt),
    lastLogin: sheetsUser.lastLogin ? new Date(sheetsUser.lastLogin) : null,
    failedAttempts: sheetsUser.failedAttempts ?? 0,
    lockedUntil: sheetsUser.lockedUntil ? new Date(sheetsUser.lockedUntil) : null,
  };
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  hashedPassword: string,
  name?: string
): Promise<User | null> {
  if (USE_POSTGRES) {
    try {
      return await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name ?? null,
        },
      });
    } catch (error) {
      console.error('Error creating user in Postgres:', error);
      return null;
    }
  }

  // Fallback to Google Sheets
  const sheetsUser = await sheetsDb.createUser(email, hashedPassword, name);
  if (!sheetsUser) return null;

  return {
    id: sheetsUser.id,
    email: sheetsUser.email,
    password: sheetsUser.password,
    name: sheetsUser.name ?? null,
    plan: sheetsUser.plan.toUpperCase() as UserPlan,
    role: sheetsUser.role.toUpperCase() as UserRole,
    createdAt: new Date(sheetsUser.createdAt),
    updatedAt: new Date(sheetsUser.createdAt),
    lastLogin: null,
    failedAttempts: 0,
    lockedUntil: null,
  };
}

/**
 * Update user's last login time
 */
export async function updateLastLogin(email: string): Promise<void> {
  if (USE_POSTGRES) {
    try {
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      console.error('Error updating last login in Postgres:', error);
    }
    return;
  }

  // Fallback to Google Sheets
  await sheetsDb.updateLastLogin(email);
}

/**
 * Update user password
 */
export async function updatePassword(email: string, newHash: string): Promise<boolean> {
  if (USE_POSTGRES) {
    try {
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { password: newHash },
      });
      return true;
    } catch (error) {
      console.error('Error updating password in Postgres:', error);
      return false;
    }
  }

  // Fallback to Google Sheets
  return await sheetsDb.updatePassword(email, newHash);
}

/**
 * Get all users (admin function)
 */
export async function getAllUsers(): Promise<User[]> {
  if (USE_POSTGRES) {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Fallback to Google Sheets
  const sheetsUsers = await sheetsDb.getAllUsers();
  return sheetsUsers.map(user => ({
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.name ?? null,
    plan: user.plan.toUpperCase() as UserPlan,
    role: user.role.toUpperCase() as UserRole,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.createdAt),
    lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
    failedAttempts: user.failedAttempts ?? 0,
    lockedUntil: user.lockedUntil ? new Date(user.lockedUntil) : null,
  }));
}

/**
 * Save research history
 */
export async function saveResearchHistory(
  userId: string,
  itemDetails: {
    name: string;
    brand: string;
    category: string;
    condition: string;
    size?: string;
    estimatedPrice: number;
  },
  results: any,
  isLocalOnly: boolean = false
): Promise<void> {
  if (USE_POSTGRES) {
    try {
      await prisma.researchHistory.create({
        data: {
          userId,
          itemName: itemDetails.name,
          itemBrand: itemDetails.brand,
          itemCategory: itemDetails.category,
          condition: itemDetails.condition,
          size: itemDetails.size ?? null,
          estimatedPrice: itemDetails.estimatedPrice,
          results,
          isLocalOnly,
        },
      });
    } catch (error) {
      console.error('Error saving research history in Postgres:', error);
    }
  }

  // Fallback to Google Sheets
  await sheetsDb.saveResearchHistory(userId, itemDetails, results, isLocalOnly);
}

/**
 * Get research history for a user
 */
export async function getResearchHistory(userId: string, limit: number = 50) {
  if (USE_POSTGRES) {
    return await prisma.researchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Fallback to Google Sheets
  return await sheetsDb.getResearchHistory(userId, limit);
}

/**
 * Track API usage (analytics)
 */
export async function trackApiUsage(data: {
  userId?: string;
  endpoint: string;
  cached: boolean;
  cost: number;
  responseTime: number;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  if (USE_POSTGRES) {
    try {
      await prisma.apiUsage.create({
        data: {
          userId: data.userId ?? null,
          endpoint: data.endpoint,
          cached: data.cached,
          cost: data.cost,
          responseTime: data.responseTime,
          success: data.success,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
        },
      });
    } catch (error) {
      console.error('Error tracking API usage:', error);
    }
  }

  // Google Sheets: skip analytics tracking
}

/**
 * Increment failed login attempts and lock account if threshold reached
 */
export async function incrementFailedAttempts(
  email: string
): Promise<{ isLocked: boolean; attemptsLeft: number }> {
  if (USE_POSTGRES) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        return { isLocked: false, attemptsLeft: 5 };
      }

      const newAttempts = user.failedAttempts + 1;

      // Lock if 5 or more attempts
      if (newAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        await prisma.user.update({
          where: { email: email.toLowerCase() },
          data: {
            failedAttempts: newAttempts,
            lockedUntil: lockUntil,
          },
        });
        return { isLocked: true, attemptsLeft: 0 };
      }

      // Update failed attempts
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { failedAttempts: newAttempts },
      });

      return { isLocked: false, attemptsLeft: 5 - newAttempts };
    } catch (error) {
      console.error('Error incrementing failed attempts in Postgres:', error);
      return { isLocked: false, attemptsLeft: 5 };
    }
  }

  // Fallback to Google Sheets
  return await sheetsDb.incrementFailedAttempts(email);
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedAttempts(email: string): Promise<void> {
  if (USE_POSTGRES) {
    try {
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
    } catch (error) {
      console.error('Error resetting failed attempts in Postgres:', error);
    }
    return;
  }

  // Fallback to Google Sheets
  await sheetsDb.resetFailedAttempts(email);
}

/**
 * Check if user is locked out
 */
export function isUserLocked(user: User): boolean {
  if (!user.lockedUntil) return false;
  const lockTime = user.lockedUntil.getTime();
  const now = Date.now();
  return now < lockTime;
}

/**
 * Save password reset token
 * Note: For now, this always uses Google Sheets even in Postgres mode
 * as reset tokens are temporary and don't need to be in the primary database
 */
export async function saveResetToken(
  email: string,
  token: string,
  expiresAt: string
): Promise<boolean> {
  return await sheetsDb.saveResetToken(email, token, expiresAt);
}

/**
 * Verify and consume reset token
 * Note: For now, this always uses Google Sheets even in Postgres mode
 */
export async function verifyResetToken(email: string, token: string): Promise<boolean> {
  return await sheetsDb.verifyResetToken(email, token);
}

export { USE_POSTGRES };
