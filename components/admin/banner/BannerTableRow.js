"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

import DeleteBannerDialog from "./DeleteBannerDialog";
import { toggleBannerActiveAction } from "@/server/actions/banner-action";
import { useRouter } from "next/navigation";

/**
 * BannerTableRow Component
 * Displays a single banner row with image preview, title, status, and actions
 *
 * @param {Object} props
 * @param {Object} props.banner - Banner data object
 */
export default function BannerTableRow({ banner }) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Toggle active/inactive status
  const handleToggleActive = async () => {
    setIsTogglingStatus(true);
    const newStatus = !banner.is_active;

    const toastId = toast.loading(
      newStatus ? "Activating banner..." : "Deactivating banner..."
    );

    try {
      const result = await toggleBannerActiveAction(banner.id, newStatus);

      if (result.error) {
        toast.error(result.error, { id: toastId });
        return;
      }

      toast.success(result.message, { id: toastId });
      router.refresh();
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to toggle banner status", { id: toastId });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <TableRow className="text-sm">
      {/* Banner Image Preview */}
      <TableCell>
        <div className="relative w-20 h-12 rounded overflow-hidden bg-muted">
          {banner.image_url ? (
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              loading="lazy"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={20} className="text-muted-foreground" />
            </div>
          )}
        </div>
      </TableCell>

      {/* Title */}
      <TableCell className="font-medium max-w-xs">
        <div>
          <p className="truncate">{banner.title}</p>
          {banner.subtitle && (
            <p className="text-xs text-muted-foreground truncate">
              {banner.subtitle}
            </p>
          )}
        </div>
      </TableCell>

      {/* Display Order */}
      <TableCell>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-xs font-medium">
          {banner.display_order}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            banner.is_active
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          )}
        >
          {banner.is_active ? "Active" : "Inactive"}
        </span>
      </TableCell>

      {/* Actions Dropdown */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isTogglingStatus}>
            <MoreHorizontal className={cn(isTogglingStatus && "opacity-50")} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Toggle Active/Inactive */}
            <DropdownMenuItem onClick={handleToggleActive}>
              {banner.is_active ? (
                <>
                  <EyeOff />
                  Deactivate
                </>
              ) : (
                <>
                  <Eye />
                  Activate
                </>
              )}
            </DropdownMenuItem>

            {/* Edit */}
            <DropdownMenuItem asChild>
              <Link href={`/admin/banners/${banner.id}/edit`}>
                <Pencil />
                Edit
              </Link>
            </DropdownMenuItem>

            {/* Delete */}
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DeleteBannerDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          banner={banner}
        />
      </TableCell>
    </TableRow>
  );
}
