/**
 * Formatting & Sanitization Utilities
 *
 * This module contains all string formatting, sanitization, and date formatting functions.
 * These utilities are used throughout the application for consistent data formatting.
 */

import { formatInTimeZone } from "date-fns-tz";
import { APP_CONFIG } from "@/lib/config";

// ============================================================================
// STRING SANITIZATION
// ============================================================================

/**
 * Sanitize and format a name string
 *
 * Trims whitespace, removes extra spaces, and capitalizes each word.
 *
 * @param {string} name - The name to sanitize
 * @returns {string} Sanitized name with proper capitalization
 *
 * @example
 * sanitizeName('  john   doe  ')
 * // Returns: 'John Doe'
 */
export function sanitizeName(name) {
  if (!name || typeof name !== "string") return "";

  return name
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .toLowerCase() // Convert to lowercase first
    .split(" ") // Split by spaces
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1) // Capitalize each word
    )
    .join(" "); // Join back with single spaces
}

/**
 * Sanitize a string to create a URL-friendly slug
 *
 * Converts to lowercase, removes special characters, and replaces spaces with hyphens.
 *
 * @param {string} slug - The string to convert to a slug
 * @returns {string} URL-friendly slug
 *
 * @example
 * sanitizeSlug('Hello World! 123')
 * // Returns: 'hello-world-123'
 */
export function sanitizeSlug(slug) {
  if (!slug || typeof slug !== "string") return "";
  return slug
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Sanitize a code string
 *
 * Removes whitespace and converts to uppercase.
 * Useful for product codes, SKUs, etc.
 *
 * @param {string} code - The code to sanitize
 * @returns {string} Sanitized code in uppercase without spaces
 *
 * @example
 * sanitizeCode('  abc 123  ')
 * // Returns: 'ABC123'
 */
export function sanitizeCode(code) {
  if (!code || typeof code !== "string") return "";

  return code.trim().replace(/\s+/g, "").toUpperCase();
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format ISO date string to "dd MMMM yyyy" format
 *
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "15 November 2024")
 *
 * @example
 * formatISODateToDayMonthNameYear('2024-11-15T10:30:00Z')
 * // Returns: '15 November 2024'
 */
export function formatISODateToDayMonthNameYear(dateString) {
  return formatInTimeZone(
    new Date(dateString),
    APP_CONFIG.timezone,
    "dd MMMM yyyy"
  );
}

/**
 * Format ISO date string to "dd MM yyyy" format
 *
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "15 11 2024")
 *
 * @example
 * formatISODateToDayMonthYear('2024-11-15T10:30:00Z')
 * // Returns: '15 11 2024'
 */
export function formatISODateToDayMonthYear(dateString) {
  return formatInTimeZone(
    new Date(dateString),
    APP_CONFIG.timezone,
    "dd MM yyyy"
  );
}

/**
 * Format ISO date string to "EEE, dd MMM yyyy" format
 *
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "Wed, 15 Nov 2024")
 *
 * @example
 * formatISODateToDayDateMonthYear('2024-11-15T10:30:00Z')
 * // Returns: 'Wed, 15 Nov 2024'
 */
export function formatISODateToDayDateMonthYear(dateString) {
  return formatInTimeZone(
    new Date(dateString),
    APP_CONFIG.timezone,
    "EEE, dd MMM yyyy"
  );
}

/**
 * Format ISO date string to "EEE, dd MMM yyyy 'at' h:mm a" format
 *
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date with time (e.g., "Wed, 15 Nov 2024 at 10:30 AM")
 *
 * @example
 * formatISODateToDayDateMonthYearWithAtTime('2024-11-15T10:30:00Z')
 * // Returns: 'Wed, 15 Nov 2024 at 10:30 AM'
 */
export function formatISODateToDayDateMonthYearWithAtTime(dateString) {
  return formatInTimeZone(
    new Date(dateString),
    APP_CONFIG.timezone,
    "EEE, dd MMM yyyy 'at' h:mm a"
  );
}

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format a number as USD currency
 *
 * @param {number} value - The number to format
 * @returns {string} Formatted currency string (e.g., "$1,234.56")
 *
 * @example
 * formatCurrency(1234.56)
 * // Returns: '$1,234.56'
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(
    value
  );
