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
