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
import { deleteCollectionByIdAction } from "@/actions/collections";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCollectionDialog({
  isOpen,
  onClose,
  collection,
  redirectTo,
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting collection...");

    try {
      const { success, error, message } = await deleteCollectionByIdAction(
        collection.id
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
      toast.error("Failed to delete collection", { id: toastId });
    } finally {
      setIsDeleting(false);
      redirectTo && router.push(redirectTo);
    }
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deleting Collection</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete
            <span className="font-bold"> &quot;{collection?.name}&quot;? </span>
            This action cannot be undone. This will permanently delete the
            collection.
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
