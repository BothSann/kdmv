import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
