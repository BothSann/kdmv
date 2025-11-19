/**
 * Validation Utilities
 *
 * This module contains all validation functions used throughout the application.
 * These utilities help validate user input, business rules, and data integrity.
 */

import { CAMBODIA_PROVINCES } from "@/lib/constants";

// ============================================================================
// PHONE NUMBER VALIDATION
// ============================================================================

/**
 * Validate if a phone number follows Cambodia's phone number format
 *
 * Supports formats:
 * - With country code: +855xxxxxxxx
 * - Without country code: 0xxxxxxxx
 * - Various mobile operators and landlines
 *
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} True if valid Cambodia phone number, false otherwise
 *
 * @example
 * isValidCambodiaPhoneNumber('+85512345678')
 * // Returns: true
 *
 * @example
 * isValidCambodiaPhoneNumber('012345678')
 * // Returns: true
 *
 * @example
 * isValidCambodiaPhoneNumber('1234')
 * // Returns: false
 */
export function isValidCambodiaPhoneNumber(phoneNumber) {
  const cambodiaPhoneNumberRegex =
    /^(?:\+855|0)(?:(?:[1-9]\d|2[3-7]|3[1-6]|4[2-4]|5[1-5]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{6,7}|(?:[1-9]\d{7,8}))$/;

  return cambodiaPhoneNumberRegex.test(phoneNumber);
}

// ============================================================================
// PRODUCT VARIANT VALIDATION
// ============================================================================

/**
 * Check if product variants contain duplicate color-size combinations
 *
 * Used during product creation/editing to prevent duplicate variants.
 * A duplicate is when two variants have the same color_id and size_id.
 *
 * @param {Array<{color_id: string, size_id: string}>} variants - Array of variant objects
 * @returns {boolean} True if duplicates exist, false otherwise
 *
 * @example
 * hasDuplicateVariants([
 *   { color_id: '1', size_id: 'M' },
 *   { color_id: '1', size_id: 'L' }
 * ])
 * // Returns: false (no duplicates)
 *
 * @example
 * hasDuplicateVariants([
 *   { color_id: '1', size_id: 'M' },
 *   { color_id: '1', size_id: 'M' }
 * ])
 * // Returns: true (duplicate found)
 */
export function hasDuplicateVariants(variants) {
  const combinations = variants
    .filter((v) => v.color_id && v.size_id)
    .map((v) => `${v.color_id}-${v.size_id}`);
  return combinations.length !== new Set(combinations).size;
}

// ============================================================================
// LOCATION VALIDATION
// ============================================================================

/**
 * Validate if a province value exists in Cambodia's provinces list
 *
 * Checks against the official CAMBODIA_PROVINCES configuration.
 * Used for address validation during checkout and profile updates.
 *
 * @param {string} value - The province value to validate
 * @returns {boolean} True if valid province, false otherwise
 *
 * @example
 * isValidProvince('phnom-penh')
 * // Returns: true
 *
 * @example
 * isValidProvince('invalid-province')
 * // Returns: false
 */
export function isValidProvince(value) {
  return CAMBODIA_PROVINCES.some((p) => p.value === value);
}
