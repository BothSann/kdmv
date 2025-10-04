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
import { deleteCouponByIdAction } from "@/actions/coupon-action";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCouponDialog({
  isOpen,
  onClose,
  coupon,
  redirectTo,
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting coupon...");

    try {
      const { success, error, message } = await deleteCouponByIdAction(
        coupon.id
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
      toast.error("Failed to delete coupon", { id: toastId });
    } finally {
      setIsDeleting(false);
      redirectTo && router.push(redirectTo);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deleting Coupon</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete
            <span className="font-bold"> &quot;{coupon?.code}&quot;? </span>
            This action cannot be undone. This will permanently delete the
            coupon.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
