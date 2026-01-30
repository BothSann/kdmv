"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Reusable sort select component that updates URL search params
 * @param {Object} options - Sort options object { key: { label: string } }
 * @param {string} defaultValue - Default sort option key
 * @param {string} paramName - URL param name (default: "sort")
 * @param {string} className - Additional CSS classes
 */
export default function SortSelect({
  options,
  defaultValue,
  paramName = "sort",
  className,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current sort value from URL, fallback to default
  const currentSort = searchParams.get(paramName) || defaultValue;

  // Validate current sort - use default if invalid
  const validSort = options[currentSort] ? currentSort : defaultValue;

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());

    // Set new sort value
    if (value === defaultValue) {
      // Remove param if it's the default to keep URL clean
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }

    // Reset to page 1 when changing sort
    params.delete("page");

    // Build new URL
    const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.push(newUrl);
  };

  return (
    <Select value={validSort} onValueChange={handleSortChange}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(options).map(([key, { label }]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
