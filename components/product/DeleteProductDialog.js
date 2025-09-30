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
import { deleteProductByIdAction } from "@/actions/products";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductDialog({
  isOpen,
  onClose,
  product,
  redirectTo,
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting product...");

    try {
      const { success, error, message } = await deleteProductByIdAction(
        product.id
      );

      if (error) {
        toast.error(error, { id: toastId });
      }

      if (success) {
        toast.success(message, { id: toastId });
      }
    } catch (err) {
      toast.error("Failed to delete product", { id: toastId });
    } finally {
      setIsDeleting(false);
      redirectTo && router.push(redirectTo);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deleting Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete
            <span className="font-bold"> &quot;{product?.name}&quot;? </span>
            This action cannot be undone. This will permanently delete the
            product and all its variants.
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
