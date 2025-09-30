"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { bulkDeleteCouponsAction } from "@/actions/coupons";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BulkDeleteCouponDialog({
  isOpen,
  onClose,
  couponIds,
  redirectTo,
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // const actionToUse = deleteProductByIdAction;

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting coupons...");

    try {
      const selectedIds = Array.from(couponIds);

      const { success, error, message } = await bulkDeleteCouponsAction(
        selectedIds
      );

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      if (success) {
        toast.success(message, { id: toastId });
        onClose();
      }
    } catch (err) {
      toast.error("Failed to delete coupons", { id: toastId });
    } finally {
      setIsDeleting(false);
      redirectTo && router.push(redirectTo);
    }
  };

  if (!couponIds || couponIds.size === 0) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Deleting {couponIds.size} Coupon{couponIds.size > 1 ? "s" : ""}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete
            <span className="font-bold">
              {" "}
              {couponIds.size} coupon{couponIds.size > 1 ? "s" : ""}?{" "}
            </span>
            This action cannot be undone. This will permanently delete the
            coupons.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleBulkDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
