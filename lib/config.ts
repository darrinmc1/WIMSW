/**
 * Application configuration
 * Centralized config for app-wide constants
 */

export const APP_CONFIG = {
  appName: 'WIMSW',
  appFullName: 'What Is My Stuff Worth',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@wimsw.com',

  // Security settings
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,

  // Session settings
  sessionMaxAge: 30 * 24 * 60 * 60, // 30 days in seconds

  // Rate limiting
  rateLimits: {
    freeAnalyzePerDay: 3,
    authenticatedAnalyzePerMinute: 5,
    marketResearchPerMinute: 10,
    generalPerMinute: 30,
  },

  // Pagination
  defaultPageSize: 50,
  maxPageSize: 100,
} as const;
