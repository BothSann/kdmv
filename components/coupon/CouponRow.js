"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, RotateCcw, TicketPercent } from "lucide-react";
import Link from "next/link";
import { Pencil, Trash2, View } from "lucide-react";
import { useState } from "react";
import { cn, formatISODateToDayDateMonthYear } from "@/lib/utils";
import DeleteCouponDialog from "./DeleteCouponDialog";
import { useCouponTableStore } from "@/store/useTableSelectionStore";
import { Checkbox } from "../ui/checkbox";
import { restoreCouponAction } from "@/actions/coupon-action";
import { toast } from "sonner";

export default function CouponRow({ coupon }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toggleItem, isSelected } = useCouponTableStore();

  const handleRestoreCoupon = async () => {
    const toastId = toast.loading("Restoring coupon...");
    try {
      setIsRestoring(true);
      const { success, error, message } = await restoreCouponAction(coupon.id);

      if (success) {
        toast.success(message, { id: toastId });
      } else {
        toast.error(error, { id: toastId });
        return;
      }
    } catch (error) {
      console.error("Error restoring coupon:", error);
      toast.error(error, { id: toastId });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <TableRow className="text-sm">
      <TableCell>
        <Checkbox
          checked={isSelected(coupon.id)}
          onCheckedChange={() => toggleItem(coupon.id)}
          aria-label={`Select ${coupon.code}`}
        />
      </TableCell>
      <TableCell className="flex items-center gap-2.5">
        <div className="bg-success/80 rounded-full p-2">
          <TicketPercent
            size={22}
            className="text-background dark:text-foreground"
          />
        </div>
        {coupon.isDeleted ? (
          <span className="text-destructive line-through">{coupon.code}</span>
        ) : (
          <span>{coupon.code}</span>
        )}
      </TableCell>
      <TableCell>{coupon.discount_percentage}%</TableCell>
      <TableCell>{coupon.total_uses}</TableCell>
      <TableCell>{coupon.max_total_uses}</TableCell>
      <TableCell>
        {formatISODateToDayDateMonthYear(coupon.valid_until)}
      </TableCell>
      <TableCell
        className={cn(
          coupon.isDeleted
            ? "text-destructive" // Show deleted state
            : coupon.isReachedUsageLimit || coupon.isExpired
            ? "text-destructive"
            : coupon.isNotYetValid
            ? "text-warning"
            : "text-success"
        )}
      >
        {coupon.isDeleted
          ? "Deleted" // NEW status
          : coupon.isReachedUsageLimit || coupon.isExpired
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
            {!coupon.isDeleted && (
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="destructive"
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            )}

            {coupon.isDeleted && (
              <DropdownMenuItem
                onClick={handleRestoreCoupon}
                variant="default"
                disabled={isRestoring}
              >
                <RotateCcw />
                Restore
              </DropdownMenuItem>
            )}
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
