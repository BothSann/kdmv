"use client";

import { TableCell, TableRow } from "./ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter, useSearchParams } from "next/navigation";

// Pagination.js - Add page numbers display
export default function Pagination({ pagination }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!pagination) return null;

  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  const startItem = (pagination.page - 1) * pagination.perPage + 1;
  const endItem = Math.min(
    pagination.page * pagination.perPage,
    pagination.count
  );

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const { page, totalPages } = pagination;
    const delta = 2;

    // Always show first page
    pages.push(1);

    if (totalPages <= 1) return pages;

    // Show dots if there's a gap
    if (page - delta > 2) {
      pages.push("...");
    }

    // Show pages around current page
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      pages.push(i);
    }

    // Show dots if there's a gap
    if (page + delta < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <TableRow>
      <TableCell colSpan={8} className="px-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">{startItem}</span>{" "}
            to <span className="font-semibold text-foreground">{endItem}</span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {pagination.count}
            </span>{" "}
            results
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={!pagination.hasPreviousPage}
              onClick={() => router.push(createPageURL(pagination.page - 1))}
            >
              <ChevronLeft />
              Previous
            </Button>

            {getPageNumbers().map((pageNum, index) => (
              <Button
                key={`${pageNum}-${index}`}
                variant={pageNum === pagination.page ? "outline" : "ghost"}
                size="sm"
                disabled={pageNum === "..."}
                onClick={() =>
                  typeof pageNum === "number" &&
                  router.push(createPageURL(pageNum))
                }
                className={pageNum === "..." ? "cursor-default" : ""}
              >
                {pageNum}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => router.push(createPageURL(pagination.page + 1))}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
