"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export default function ProductFilters({
  productTypes = [],
  genders = [],
  currentProductTypeId,
  currentGender,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("type");
    params.delete("gender");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = currentProductTypeId || currentGender;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Product Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Type:</span>
        <Select
          value={currentProductTypeId || "all"}
          onValueChange={(value) =>
            updateFilter("type", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {productTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Gender:</span>
        <div className="flex gap-1">
          <Button
            variant={!currentGender ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("gender", null)}
          >
            All
          </Button>
          {genders.map((option) => (
            <Button
              key={option.slug}
              variant={currentGender === option.slug ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("gender", option.slug)}
            >
              {option.name}
            </Button>
          ))}
        </div>
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
