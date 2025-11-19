/**
 * Utility Functions
 *
 * This is the main utils file that provides:
 * 1. The cn() function for className merging (stays here as it's UI-specific)
 * 2. Re-exports of all categorized utilities from lib/utils/* modules
 *
 * You can import from either:
 * - '@/lib/utils' (this file) - for backward compatibility
 * - '@/lib/utils/formatters' - for specific category imports
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// TAILWIND UTILITIES (UI-SPECIFIC - STAYS HERE)
// ============================================================================

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 *
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 * This is the recommended way to combine Tailwind classes in React components.
 *
 * @param {...any} inputs - Class names (strings, objects, arrays)
 * @returns {string} Merged class string
 *
 * @example
 * cn('px-4 py-2', 'bg-blue-500')
 * // Returns: 'px-4 py-2 bg-blue-500'
 *
 * @example
 * cn('px-4', { 'py-2': true, 'py-4': false })
 * // Returns: 'px-4 py-2'
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// RE-EXPORTS FROM CATEGORIZED MODULES
// ============================================================================

// Formatting & Sanitization
export {
  sanitizeName,
  sanitizeSlug,
  sanitizeCode,
  formatISODateToDayMonthNameYear,
  formatISODateToDayMonthYear,
  formatISODateToDayDateMonthYear,
  formatISODateToDayDateMonthYearWithAtTime,
  formatCurrency,
} from "./utils/formatters";

// Validation
export {
  isValidCambodiaPhoneNumber,
  hasDuplicateVariants,
  isValidProvince,
} from "./utils/validators";

// ID & Name Generation
export {
  generateUniqueTelephonePlaceholder,
  generateUniqueImageName,
  generateUniqueOrderNumber,
} from "./utils/generators";

// Order & Location Helpers
export {
  generateStatusChangeNote,
  getProvinceLabel,
} from "./utils/orderHelpers";

// Date Range Helpers
export {
  getDateRangeFromFilter,
  getPreviousPeriodRange,
  getFilterOptions,
  isValidFilter,
} from "./utils/dateRangeHelper";
