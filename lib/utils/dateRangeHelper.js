/**
 * Date Range Helper for Dashboard Filters
 *
 * This utility provides functions to calculate date ranges based on filter options
 * for the admin dashboard analytics. It handles timezone conversion for Cambodia (UTC+7).
 */

import { subDays, startOfDay, endOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { APP_CONFIG } from "@/lib/config";

/**
 * Get date range from filter option
 *
 * Converts a filter string (e.g., 'last7days') into start and end dates
 * for querying the database. All dates are converted to UTC for consistency.
 *
 * @param {string} filter - The filter option ('last7days', 'last30days', 'last90days')
 * @returns {Object} Object containing startDate, endDate (ISO strings), and label
 *
 * @example
 * const { startDate, endDate, label } = getDateRangeFromFilter('last7days');
 * // Returns:
 * // {
 * //   startDate: '2024-11-11T00:00:00.000Z',
 * //   endDate: '2024-11-18T23:59:59.999Z',
 * //   label: 'Last 7 Days',
 * //   daysCount: 7
 * // }
 */
export function getDateRangeFromFilter(filter) {
  const now = new Date();
  const timezone = APP_CONFIG.timezone; // "Asia/Phnom_Penh" (UTC+7)

  let startDate, daysCount, label;

  // Determine the start date and label based on filter
  switch (filter) {
    case "last7days":
      startDate = subDays(now, 7);
      daysCount = 7;
      label = "Last 7 Days";
      break;

    case "last30days":
      startDate = subDays(now, 30);
      daysCount = 30;
      label = "Last 30 Days";
      break;

    case "last90days":
      startDate = subDays(now, 90);
      daysCount = 90;
      label = "Last 90 Days";
      break;

    default:
      // Default to last 7 days if invalid filter
      startDate = subDays(now, 7);
      daysCount = 7;
      label = "Last 7 Days";
  }

  // Set to start of day (00:00:00) for startDate
  // Set to end of day (23:59:59.999) for endDate
  const startOfDayDate = startOfDay(startDate);
  const endOfDayDate = endOfDay(now);

  // Convert to UTC for database queries
  // Cambodia is UTC+7, so we need to convert local time to UTC
  const startUTC = fromZonedTime(startOfDayDate, timezone);
  const endUTC = fromZonedTime(endOfDayDate, timezone);

  return {
    startDate: startUTC.toISOString(),
    endDate: endUTC.toISOString(),
    label,
    daysCount,
  };
}

/**
 * Get previous period date range for comparison
 *
 * Calculates the equivalent date range for the previous period
 * to enable growth/trend calculations.
 *
 * @param {string} startDate - ISO string of current period start date
 * @param {string} endDate - ISO string of current period end date
 * @returns {Object} Object containing previousStartDate and previousEndDate
 *
 * @example
 * const current = getDateRangeFromFilter('last7days');
 * const previous = getPreviousPeriodRange(current.startDate, current.endDate);
 * // If current period is Nov 11-18 (7 days)
 * // Previous period will be Nov 4-11 (7 days)
 */
export function getPreviousPeriodRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate the number of milliseconds in the period
  const periodMilliseconds = end.getTime() - start.getTime();

  // Calculate previous period dates
  const previousEnd = new Date(start.getTime() - 1); // One millisecond before current start
  const previousStart = new Date(previousEnd.getTime() - periodMilliseconds);

  return {
    previousStartDate: previousStart.toISOString(),
    previousEndDate: previousEnd.toISOString(),
  };
}

/**
 * Get filter options for dropdown/select
 *
 * @returns {Array} Array of filter options with label and value
 */
export function getFilterOptions() {
  return [
    { label: "Last 7 days", value: "last7days" },
    { label: "Last 30 days", value: "last30days" },
    { label: "Last 90 days", value: "last90days" },
  ];
}

/**
 * Validate if a filter option is valid
 *
 * @param {string} filter - The filter to validate
 * @returns {boolean} True if filter is valid
 */
export function isValidFilter(filter) {
  const validFilters = ["last7days", "last30days", "last90days"];
  return validFilters.includes(filter);
}
