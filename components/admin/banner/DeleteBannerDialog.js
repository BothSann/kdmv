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
import { deleteBannerAction } from "@/server/actions/banner-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * DeleteBannerDialog Component
 * Confirmation dialog for deleting a banner
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether dialog is open
 * @param {Function} props.onClose - Callback to close dialog
 * @param {Object} props.banner - Banner object to delete
 */
export default function DeleteBannerDialog({ isOpen, onClose, banner }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting banner...");

    try {
      const result = await deleteBannerAction(banner.id, banner.image_url);

      if (result.error) {
        toast.error(result.error, { id: toastId });
        return;
      }

      toast.success(result.message, { id: toastId });
      onClose();
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete banner", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Banner</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the banner
            <span className="font-bold"> &quot;{banner?.title}&quot;</span>?
            This action cannot be undone. The banner image will also be removed
            from storage.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
