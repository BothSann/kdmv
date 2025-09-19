"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, TicketPercent } from "lucide-react";
import Link from "next/link";
import { Pencil, Trash2, View } from "lucide-react";
import { useState } from "react";
import { cn, formatISODateToDayDateMonthYear } from "@/lib/utils";
import DeleteCouponDialog from "./DeleteCouponDialog";

export default function CouponRow({ coupon }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <TableRow className="text-sm">
      <TableCell className="flex items-center gap-2.5">
        <div className="bg-success/80 rounded-full p-2">
          <TicketPercent size={22} className="text-background" />
        </div>
        <span>{coupon.code}</span>
      </TableCell>
      <TableCell>{coupon.discount_percentage}%</TableCell>
      <TableCell>{coupon.total_uses}</TableCell>
      <TableCell>{coupon.max_total_uses}</TableCell>
      <TableCell>
        {formatISODateToDayDateMonthYear(coupon.valid_until)}
      </TableCell>
      <TableCell
        className={cn(
          coupon.isReachedUsageLimit || coupon.isExpired
            ? "text-destructive"
            : coupon.isNotYetValid
            ? "text-warning"
            : "text-success"
        )}
      >
        {coupon.isReachedUsageLimit || coupon.isExpired
          ? "Inactive"
          : coupon.isNotYetValid
          ? "Not Yet Active"
          : "Active"}
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={`/admin/coupons/${coupon.id}`}>
                <View />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/coupons/${coupon.id}/edit`}>
                <Pencil />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DeleteCouponDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          coupon={coupon}
        />
      </TableCell>
    </TableRow>
  );
}
