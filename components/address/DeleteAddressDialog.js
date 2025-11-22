"use client";

import { deleteAddressAction } from "@/server/actions/address-action";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteAddressDialog({
  isOpen,
  onClose,
  addressId,
  customerId,
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAddress = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting address...");
    try {
      const result = await deleteAddressAction(addressId, customerId);

      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else {
        toast.success(result.message, { id: toastId });
        onClose();
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deleting Address</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this address? This action cannot be
            undone. This will permanently delete the address.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAddress}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
