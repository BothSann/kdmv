import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(
    value
  );

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

export function sanitizeCode(code) {
  if (!code || typeof code !== "string") return "";

  return code.trim().replace(/\s+/g, "").toUpperCase();
}

export function isValidCambodiaPhoneNumber(phoneNumber) {
  const cambodiaPhoneNumberRegex =
    /^(?:\+855|0)(?:(?:[1-9]\d|2[3-7]|3[1-6]|4[2-4]|5[1-5]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{6,7}|(?:[1-9]\d{7,8}))$/;

  return cambodiaPhoneNumberRegex.test(phoneNumber);
}

export function generateUniqueTelephonePlaceholder() {
  return `TEMP_${Date.now()}`;
}

export function formatISODateToDayMonthNameYear(dateString) {
  const formattedDate = format(new Date(dateString), "dd MMMM yyyy");
  return formattedDate;
}
export function formatISODateToDayMonthYear(dateString) {
  const formattedDate = format(new Date(dateString), "dd MM yyyy");
  return formattedDate;
}

export function formatISODateToDayDateMonthYear(dateString) {
  const formattedDate = format(new Date(dateString), "EEE, dd MMM yyyy");
  return formattedDate;
}

export function formatISODateToDayDateMonthYearWithAtTime(dateString) {
  const formattedDate = format(
    new Date(dateString),
    "EEE, dd MMM yyyy 'at' h:mm a"
  );
  return formattedDate;
}

export function generateUniqueImageName(file, prefix = "") {
  if (!file?.name) return null;

  const timestamp = Math.random();
  const prefixPart = prefix ? `${prefix}-` : "";

  return `${prefixPart}${timestamp}-${file.name}`
    .replaceAll("/", "-")
    .replaceAll(" ", "-")
    .replaceAll("--", "-");
}

export function hasDuplicateVariants(variants) {
  const combinations = variants
    .filter((v) => v.color_id && v.size_id)
    .map((v) => `${v.color_id}-${v.size_id}`);
  return combinations.length !== new Set(combinations).size;
}

export function generateUniqueOrderNumber() {
  const shortTimestamp = Date.now().toString().slice(-8);
  const randomString = Math.random()
    .toString(36)
    .substring(2, 8) // Changed from substr(2, 9) to substring(2, 8) for 6 chars
    .toUpperCase();

  return `ORD-${shortTimestamp}-${randomString}`;
}

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

    // Default fallback
    default: `Status changed from ${fromStatus} to ${toStatus}`,
  };

  return notesMap[`${fromStatus}-${toStatus}`] || notesMap.default;
};
