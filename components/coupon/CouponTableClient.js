"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableFooter,
} from "@/components/ui/table";
import CouponRow from "./CouponRow";
import Pagination from "../Pagination";
import { Checkbox } from "../ui/checkbox";
import { useCouponTableStore } from "@/store/useTableSelectionStore";
import { Button } from "../ui/button";
import { Trash2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import BulkDeleteCouponDialog from "./BulkDeleteCouponDialog";

export default function CouponTableClient({ coupons, pagination }) {
  const tableHeaders = [
    { label: "", key: "select" },
    { label: "Code", key: "code" },
    { label: "Discount", key: "discount" },
    { label: "Total Uses", key: "total_uses" },
    { label: "Max Uses", key: "max_uses" },
    { label: "Expiry Date", key: "expiry_date" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const {
    selectAll,
    selectedItems,
    toggleSelectAll,
    getSelectedCount,
    clearSelection,
  } = useCouponTableStore();

  const couponIds = coupons.map((coupon) => coupon.id);
  const selectedCount = getSelectedCount();

  // Clear selections when products change (page navigation)
  useEffect(() => {
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupons]);

  const handleSelectAll = () => {
    toggleSelectAll(couponIds);
  };

  return (
    <div>
      {selectedCount > 0 && (
        <div className="px-4 py-2 bg-muted/50 border border-border mt-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedCount} coupon{selectedCount !== 1 ? "s" : ""} selected
            </span>

            <div className="flex gap-4 items-center">
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X />
                Clear Selection
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  size="sm"
                  className="flex cursor-pointer items-center text-sm font-medium"
                >
                  <MoreVertical />
                  Actions
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                  >
                    <Trash2 />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <BulkDeleteCouponDialog
                isOpen={isBulkDeleteDialogOpen}
                onClose={() => setIsBulkDeleteDialogOpen(false)}
                couponIds={selectedItems}
                redirectTo="/admin/coupons"
              />
            </div>
          </div>
        </div>
      )}

      <Table className="mt-10 border">
        <TableHeader>
          <TableRow>
            {tableHeaders.map((header) => (
              <TableHead key={header.key}>
                {header.key === "select" ? (
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all coupons"
                  />
                ) : (
                  header.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <CouponRow key={coupon.id} coupon={coupon} />
          ))}
        </TableBody>

        {pagination && (
          <TableFooter>
            <Pagination
              pagination={pagination}
              totalColumns={tableHeaders.length}
            />
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
