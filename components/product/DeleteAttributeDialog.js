"use client";

import { useState } from "react";
import { toast } from "sonner";
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
  deleteProductTypeAction,
  deleteGenderAction,
} from "@/server/actions/product-attribute-action";

export default function DeleteAttributeDialog({ item, type, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const label = type === "productType" ? "product type" : "gender";

  const handleDelete = async () => {
    if (!item) return;

    setIsDeleting(true);
    const toastId = toast.loading(`Deleting ${label}...`);

    try {
      const action =
        type === "productType" ? deleteProductTypeAction : deleteGenderAction;
      const { success, error, message } = await action(item.id);

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      if (success) {
        toast.success(message, { id: toastId });
        onClose();
      }
    } catch (err) {
      toast.error("An unexpected error occurred", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{item?.name}&quot;? This
            action cannot be undone. If products are using this {label}, deletion
            will be blocked.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
