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
