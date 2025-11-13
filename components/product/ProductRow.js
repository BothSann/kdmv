"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, RotateCcw, Trash2, View } from "lucide-react";
import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";
import DeleteProductDialog from "./DeleteProductDialog";
import { Checkbox } from "../ui/checkbox";
import { useProductTableStore } from "@/store/useTableSelectionStore";
import { restoreProductAction } from "@/server/actions/product-action";
import { toast } from "sonner";

export default function ProductRow({ product }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toggleItem, isSelected } = useProductTableStore();

  const isInStock = product.total_stock > 0;
  const isDeleted = product.isDeleted;

  const handleSelect = () => {
    toggleItem(product.id);
  };

  const handleRestoreProduct = async () => {
    const toastId = toast.loading("Restoring product...");
    try {
      setIsRestoring(true);
      const { success, error, message } = await restoreProductAction(
        product.id
      );

      if (success) {
        toast.success(message, { id: toastId });
      } else {
        toast.error(error, { id: toastId });
        return;
      }
    } catch (error) {
      console.error("Error restoring product:", error);
      toast.error(error, { id: toastId });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <TableRow
      className={cn(isDeleted && "opacity-50 line-through text-destructive")}
    >
      <TableCell>
        <Checkbox
          checked={isSelected(product.id)}
          onCheckedChange={handleSelect}
          aria-label={`Select ${product.name}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14">
            <Image
              src={product.banner_image_url}
              alt={product.name}
              fill
              sizes="100vw"
              quality={50}
              loading="lazy"
              className="object-cover object-top"
            />
          </div>
          <p>{product.name}</p>
        </div>
      </TableCell>
      <TableCell>{formatCurrency(product.base_price)}</TableCell>
      <TableCell>
        {product.has_discount
          ? `${product.discount_percentage}%`
          : "No Discount"}
      </TableCell>
      <TableCell>{product.category_name || "No Category"}</TableCell>
      <TableCell>{product.collection_name || "No Collection"}</TableCell>
      <TableCell>{product.total_stock}</TableCell>
      <TableCell>{product.product_code || "No Code"}</TableCell>
      <TableCell>
        {isDeleted ? (
          <span>Deleted</span>
        ) : isInStock ? (
          <span className="text-success">In Stock</span>
        ) : (
          <span className="text-destructive">Out Of Stock</span>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${product.id}`}>
                <View />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${product.id}/edit`}>
                <Pencil />
                Edit
              </Link>
            </DropdownMenuItem>
            {!isDeleted && (
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="destructive"
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            )}
            {isDeleted && (
              <DropdownMenuItem
                onClick={handleRestoreProduct}
                variant="default"
                disabled={isRestoring}
              >
                <RotateCcw />
                Restore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DeleteProductDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          product={product}
        />
      </TableCell>
    </TableRow>
  );
}
