"use client";

/**
 * DashboardFilter Component
 *
 * Dropdown filter for selecting dashboard time period.
 * Updates URL search params to maintain filter state across navigation.
 */

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FILTER_OPTIONS = [
  { label: "Last 7 days", value: "last7days" },
  { label: "Last 30 days", value: "last30days" },
  { label: "Last 90 days", value: "last90days" },
];

/**
 * DashboardFilter Component
 *
 * @param {Object} props
 * @param {string} props.defaultValue - Default filter value (default: 'last7days')
 *
 * @example
 * <DashboardFilter defaultValue="last30days" />
 */
export function DashboardFilter({ defaultValue = "last7days" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("period") || defaultValue;

  const handleFilterChange = (value) => {
    // Create new URLSearchParams from current params
    const params = new URLSearchParams(searchParams);
    params.set("period", value);

    // Update URL with new params (triggers page re-render)
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={currentFilter} onValueChange={handleFilterChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {FILTER_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default DashboardFilter;
