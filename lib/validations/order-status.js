import { z } from "zod";

/**
 * Zod validation schema for Order Status Update form
 * Used in OrderStatusUpdateDialog.js with React Hook Form
 */

// Define valid order statuses as enum
export const OrderStatus = z.enum([
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const orderStatusUpdateSchema = z.object({
  // New status - Required, must be one of the enum values
  status: OrderStatus,

  // Notes - Optional, for admin comments about the status change
  notes: z
    .string()
    .trim()
    .max(500, "Notes must not exceed 500 characters")
    .optional()
    .or(z.literal("")), // Allow empty string for optional textarea
});
