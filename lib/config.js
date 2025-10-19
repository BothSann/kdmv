/**
 * Application configuration
 * Centralizes all environment-dependent values
 */

/**
 * Get the application base URL
 * Works in both client and server contexts
 */
export function getBaseUrl() {
  // 1. Check explicit BASE_URL (server-side)
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }

  // 2. Check NEXT_PUBLIC_BASE_URL (client-safe)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 3. Check if running on Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 4. Browser fallback
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // 5. Default to localhost
  return "http://localhost:3000";
}

/**
 * Check if running in production
 */
export function isProduction() {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if running in development
 */
export function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

export const APP_CONFIG = {
  timezone: "Asia/Phnom_Penh", // UTC+7
  currency: "USD",
  locale: "en-US",
};
