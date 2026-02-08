"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { USER_ROLE_OPTIONS } from "@/lib/constants";

export default function UserFilters({ currentRole, currentSearch }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for search input (for debouncing)
  const [searchInput, setSearchInput] = useState(currentSearch || "");

  // Sync search input with URL when it changes externally
  useEffect(() => {
    setSearchInput(currentSearch || "");
  }, [currentSearch]);

  const updateFilter = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Reset to page 1 when filters change
      params.delete("page");

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (currentSearch || "")) {
        updateFilter("search", searchInput || null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, updateFilter]);

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("role");
    params.delete("search");
    params.delete("page");
    setSearchInput("");
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = currentRole || currentSearch;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 w-[250px]"
        />
      </div>

      {/* Role Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Role:</span>
        <Select
          value={currentRole || "all"}
          onValueChange={(value) =>
            updateFilter("role", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Users" />
          </SelectTrigger>
          <SelectContent>
            {USER_ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
