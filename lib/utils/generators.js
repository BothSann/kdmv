/**
 * ID & Name Generation Utilities
 *
 * This module contains all functions that generate unique identifiers, names, and codes.
 * These utilities ensure uniqueness and proper formatting for various entities.
 */

// ============================================================================
// PLACEHOLDER GENERATION
// ============================================================================

/**
 * Generate a unique temporary telephone placeholder
 *
 * Used when a real phone number isn't available yet but a unique identifier is needed.
 * Creates a placeholder with timestamp for uniqueness.
 *
 * @returns {string} Temporary placeholder in format "TEMP_<timestamp>"
 *
 * @example
 * generateUniqueTelephonePlaceholder()
 * // Returns: 'TEMP_1732046400000'
 */
export function generateUniqueTelephonePlaceholder() {
  return `TEMP_${Date.now()}`;
}

// ============================================================================
// IMAGE NAME GENERATION
// ============================================================================

/**
 * Generate a unique image filename from an uploaded file
 *
 * Creates a unique filename using random number and original filename.
 * Sanitizes the name by replacing special characters with hyphens.
 *
 * @param {File} file - The uploaded file object with a name property
 * @param {string} [prefix=""] - Optional prefix to add before the filename
 * @returns {string|null} Unique sanitized filename, or null if file/name is invalid
 *
 * @example
 * generateUniqueImageName(file, 'product')
 * // Returns: 'product-0.123456-image name.jpg'
 *
 * @example
 * generateUniqueImageName(file)
 * // Returns: '0.789123-my-photo.png'
 */
export function generateUniqueImageName(file, prefix = "") {
  if (!file?.name) return null;

  const timestamp = Math.random();
  const prefixPart = prefix ? `${prefix}-` : "";

  return `${prefixPart}${timestamp}-${file.name}`
    .replaceAll("/", "-")
    .replaceAll(" ", "-")
    .replaceAll("--", "-");
}

// ============================================================================
// ORDER NUMBER GENERATION
// ============================================================================

/**
 * Generate a unique order number for e-commerce transactions
 *
 * Creates a unique order identifier combining:
 * - Prefix "ORD-"
 * - Last 8 digits of current timestamp
 * - 6-character random alphanumeric string (uppercase)
 *
 * @returns {string} Unique order number in format "ORD-<timestamp>-<random>"
 *
 * @example
 * generateUniqueOrderNumber()
 * // Returns: 'ORD-46400000-A1B2C3'
 *
 * @example
 * generateUniqueOrderNumber()
 * // Returns: 'ORD-46400123-X9Y8Z7'
 */
export function generateUniqueOrderNumber() {
  const shortTimestamp = Date.now().toString().slice(-8);
  const randomString = Math.random()
    .toString(36)
    .substring(2, 8) // 6 characters
    .toUpperCase();

  return `ORD-${shortTimestamp}-${randomString}`;
}
