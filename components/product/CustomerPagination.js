"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomerPagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  basePath = "/products", // Dynamic base path, defaults to /products for backwards compatibility
}) {
  return (
    <div className="flex justify-center gap-4 items-center">
      {/* Previous Button */}
      <PaginationArrow
        direction="prev"
        href={`${basePath}?page=${currentPage - 1}`}
        disabled={!hasPreviousPage}
        icon={ChevronLeft}
      />

      {/* Page Info */}
      <span>
        Page {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <PaginationArrow
        direction="next"
        href={`${basePath}?page=${currentPage + 1}`}
        disabled={!hasNextPage}
        icon={ChevronRight}
      />
    </div>
  );
}

// Helper component for a single pagination arrow button
function PaginationArrow({ direction, href, disabled, icon: Icon }) {
  const isNext = direction === "next";

  if (disabled) {
    // Render disabled button
    return (
      <Button size="icon" className="rounded-full p-5" disabled>
        <Icon className="scale-125" />
      </Button>
    );
  }

  // Render enabled button with Link
  return (
    <Button size="icon" className="rounded-full p-5" asChild>
      <Link href={href}>
        <Icon className="scale-125" />
      </Link>
    </Button>
  );
}
