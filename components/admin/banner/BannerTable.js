"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableFooter,
} from "@/components/ui/table";
import BannerTableRow from "./BannerTableRow";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import { Tv } from "lucide-react";

/**
 * BannerTable Component
 * Displays banners in a table format with pagination
 *
 * @param {Object} props
 * @param {Array} props.banners - Array of banner objects
 * @param {Object} props.pagination - Pagination data
 */
export default function BannerTable({ banners, pagination }) {
  const tableHeaders = [
    { key: "image", label: "Image" },
    { key: "title", label: "Title" },
    { key: "order", label: "Order" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  // Show empty state if no banners
  if (!banners || banners.length === 0) {
    return (
      <EmptyState
        icon={Tv}
        title="No banners yet"
        description="Create your first hero banner to display on the homepage"
      />
    );
  }

  return (
    <Table className="mt-10 border rounded-lg">
      <TableHeader>
        <TableRow>
          {tableHeaders.map((header) => (
            <TableHead key={header.key}>{header.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {banners.map((banner) => (
          <BannerTableRow key={banner.id} banner={banner} />
        ))}
      </TableBody>

      {pagination && pagination.totalPages > 1 && (
        <TableFooter>
          <Pagination
            pagination={pagination}
            totalColumns={tableHeaders.length}
          />
        </TableFooter>
      )}
    </Table>
  );
}
