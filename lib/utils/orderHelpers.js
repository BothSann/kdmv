/**
 * Order & Location Helper Utilities
 *
 * This module contains helper functions specific to order processing and location management.
 * These utilities support order status tracking and location data formatting.
 */

import { CAMBODIA_PROVINCES } from "@/lib/constants";

// ============================================================================
// ORDER STATUS HELPERS
// ============================================================================

/**
 * Generate a user-friendly note message when an order status changes
 *
 * Provides standardized messages for all status transitions in the order lifecycle.
 * Used in order history tracking and customer notifications.
 *
 * Supported transitions:
 * - PENDING → CONFIRMED: "Seller has confirmed your order."
 * - CONFIRMED → SHIPPED: "Your Item has been picked up by courier partner."
 * - SHIPPED → DELIVERED: "Your order has been successfully delivered."
 * - Any → CANCELLED: "Order has been cancelled."
 *
 * @param {string} fromStatus - The previous order status
 * @param {string} toStatus - The new order status
 * @returns {string} User-friendly status change message
 *
 * @example
 * generateStatusChangeNote('PENDING', 'CONFIRMED')
 * // Returns: 'Seller has confirmed your order.'
 *
 * @example
 * generateStatusChangeNote('CONFIRMED', 'SHIPPED')
 * // Returns: 'Your Item has been picked up by courier partner.'
 *
 * @example
 * generateStatusChangeNote('SHIPPED', 'CANCELLED')
 * // Returns: 'Order has been cancelled.'
 *
 * @example
 * generateStatusChangeNote('UNKNOWN1', 'UNKNOWN2')
 * // Returns: 'Status changed from UNKNOWN1 to UNKNOWN2'
 */
export const generateStatusChangeNote = (fromStatus, toStatus) => {
  const notesMap = {
    // PENDING to CONFIRMED
    "PENDING-CONFIRMED": "Seller has confirmed your order.",

    // CONFIRMED to SHIPPED
    "CONFIRMED-SHIPPED": "Your Item has been picked up by courier partner.",

    // SHIPPED to DELIVERED
    "SHIPPED-DELIVERED": "Your order has been successfully delivered.",

    // Any status to CANCELLED
    "PENDING-CANCELLED": "Order has been cancelled.",
    "CONFIRMED-CANCELLED": "Order has been cancelled.",
    "SHIPPED-CANCELLED": "Order has been cancelled.",
    "DELIVERED-CANCELLED": "Order has been cancelled.",

    // Default fallback
    default: `Status changed from ${fromStatus} to ${toStatus}`,
  };

  return notesMap[`${fromStatus}-${toStatus}`] || notesMap.default;
};

// ============================================================================
// LOCATION HELPERS
// ============================================================================

/**
 * Get the display label for a province value
 *
 * Converts a province value (e.g., "Phnom Penh") to its full display label
 * including both English and Khmer names (e.g., "Phnom Penh (ភ្នំពេញ)").
 *
 * Used for displaying addresses in a user-friendly format.
 *
 * @param {string} value - The province value to look up
 * @returns {string} The display label with Khmer translation, or original value if not found
 *
 * @example
 * getProvinceLabel('Phnom Penh')
 * // Returns: 'Phnom Penh (ភ្នំពេញ)'
 *
 * @example
 * getProvinceLabel('Siem Reap')
 * // Returns: 'Siem Reap (សៀមរាប)'
 *
 * @example
 * getProvinceLabel('Unknown')
 * // Returns: 'Unknown' (not found in CAMBODIA_PROVINCES)
 */
export function getProvinceLabel(value) {
  const province = CAMBODIA_PROVINCES.find((p) => p.value === value);
  return province ? province.label : value;
}
