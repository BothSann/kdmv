/**
 * Utility Functions - Barrel Export
 *
 * This file re-exports all utility functions from their categorized modules.
 * Import from this file to access any utility function.
 *
 * @example
 * import { sanitizeName, formatCurrency, isValidProvince } from '@/lib/utils';
 */

// Re-export all formatters
export {
  sanitizeName,
  sanitizeSlug,
  sanitizeCode,
  formatISODateToDayMonthNameYear,
  formatISODateToDayMonthYear,
  formatISODateToDayDateMonthYear,
  formatISODateToDayDateMonthYearWithAtTime,
  formatCurrency,
} from "./formatters";

// Re-export all validators
export {
  isValidCambodiaPhoneNumber,
  hasDuplicateVariants,
  isValidProvince,
} from "./validators";

// Re-export all generators
export {
  generateUniqueTelephonePlaceholder,
  generateUniqueImageName,
  generateUniqueOrderNumber,
} from "./generators";

// Re-export all order helpers
export { generateStatusChangeNote, getProvinceLabel } from "./orderHelpers";

// Re-export date range helper
export {
  getDateRangeFromFilter,
  getPreviousPeriodRange,
  getFilterOptions,
  isValidFilter,
} from "./dateRangeHelper";
