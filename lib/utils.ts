import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface RetryOptions {
  retries?: number
  backoff?: number
  factor?: number
}

export async function fetchWithRetry(url: string, options: RequestInit = {}, retryOptions: RetryOptions = {}): Promise<Response> {
  const { retries = 3, backoff = 1000, factor = 2 } = retryOptions

  let currentBackoff = backoff

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options)

      // If response is successful, or client error (4xx) which shouldn't be retried
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response
      }

      if (i === retries) {
        throw new Error(`Request failed with status ${response.status}`)
      }

    } catch (error) {
      if (i === retries) {
        throw error
      }
    }

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, currentBackoff))
    currentBackoff *= factor
  }

  throw new Error("Unreachable")
}

/**
 * Sanitize user input to prevent prompt injection attacks in AI prompts.
 * Removes or escapes characters commonly used in prompt injection attempts.
 *
 * @param input - User-provided string to sanitize
 * @param maxLength - Maximum allowed length (default 500)
 * @returns Sanitized string safe for use in AI prompts
 */
export function sanitizePromptInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input
    // Truncate to max length
    .slice(0, maxLength)
    // Remove control characters except newline and tab (and zero-width characters)
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '')
    // Remove excessive newlines (common in injection attempts)
    .replace(/\n{3,}/g, '\n\n')
    // Remove common prompt injection patterns
    .replace(/\b(ignore|disregard|forget)\s+.*?\s*(instructions?|prompts?|rules?|commands?)\b/gi, '[FILTERED]')
    .replace(/\b(act\s+as|pretend\s+to\s+be|you\s+are\s+now)\s+/gi, '[FILTERED] ')
    .replace(/\b(system|assistant|user):\s*/gi, '[FILTERED]')
    // Remove attempts to break out of context
    .replace(/```[\s\S]*?```/g, '[CODE_BLOCK]')
    .replace(/<\/?[a-z][^>]*>/gi, '[TAG]')
    // Normalize excessive punctuation
    .replace(/([!?.]){4,}/g, '$1$1$1')
    // Trim whitespace
    .trim();

  return sanitized;
}

/**
 * Validation result for input relevance checking
 */
export interface RelevanceCheckResult {
  isRelevant: boolean;
  reason?: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Check if user input is relevant to item analysis/market research.
 * Detects spam, nonsense, or malicious content.
 *
 * @param input - User-provided string to validate
 * @param fieldName - Name of the field being validated (for error messages)
 * @returns Validation result with relevance status and reason
 */
export function checkInputRelevance(
  input: string,
  fieldName: string = 'input'
): RelevanceCheckResult {
  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return {
      isRelevant: false,
      reason: `${fieldName} cannot be empty`,
      confidence: 'high',
    };
  }

  const trimmed = input.trim().toLowerCase();

  // Check for obvious spam/nonsense patterns
  const spamPatterns = [
    /^(.)\1{10,}$/, // Repeated single character (aaaaaaaaaa)
    /^(test|asdf|qwer|zxcv|1234){3,}/i, // Common keyboard spam
    /[^\w\s]{10,}/, // Excessive special characters
    /^\d+$/, // Only numbers (for text fields)
    /^[a-z]$/i, // Single character
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isRelevant: false,
        reason: `${fieldName} appears to be invalid. Please enter meaningful information about your item.`,
        confidence: 'high',
      };
    }
  }

  // Check for prompt injection attempts (already filtered but we can reject)
  const injectionPatterns = [
    /\[FILTERED\]/,
    /\[CODE_BLOCK\]/,
    /\[TAG\]/,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(input)) {
      return {
        isRelevant: false,
        reason: `${fieldName} contains invalid content. Please provide only relevant item details.`,
        confidence: 'high',
      };
    }
  }

  // Check for extremely short input (less than 2 characters for names)
  if (fieldName.toLowerCase().includes('name') && trimmed.length < 2) {
    return {
      isRelevant: false,
      reason: `${fieldName} is too short. Please provide a descriptive item name.`,
      confidence: 'medium',
    };
  }

  // Check for suspicious URLs or email patterns (not relevant to item details)
  if (/https?:\/\/|www\.|@.*\.(com|net|org)/.test(trimmed)) {
    return {
      isRelevant: false,
      reason: `${fieldName} should not contain URLs or email addresses.`,
      confidence: 'high',
    };
  }

  // All checks passed
  return {
    isRelevant: true,
    confidence: 'high',
  };
}
