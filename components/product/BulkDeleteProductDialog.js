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
import {
  bulkDeleteProductsAction,
  deleteProductByIdAction,
} from "@/lib/actions";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BulkDeleteProductDialog({
  isOpen,
  onClose,
  productIds,
  redirectTo,
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // const actionToUse = deleteProductByIdAction;

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting products...");

    try {
      const selectedIds = Array.from(productIds);

      const { success, error, message } = await bulkDeleteProductsAction(
        selectedIds
      );

      if (error) {
        toast.error(error, { id: toastId });
      }

      if (success) {
        toast.success(message, { id: toastId });
        onClose();
      }
    } catch (err) {
      toast.error("Failed to delete products", { id: toastId });
    } finally {
      setIsDeleting(false);
      redirectTo && router.push(redirectTo);
    }
  };

  if (!productIds || productIds.size === 0) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {productIds.size} Products</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete
            <span className="font-bold"> {productIds.size} products? </span>
            This action cannot be undone. This will permanently delete the
            products and all their variants.
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
