"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, View } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";
import DeleteProductDialog from "./DeleteProductDialog";

export default function ProductRow({ product }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  console.log(product);

  // const total_stock = product.
  return (
    <TableRow className="text-sm">
      <TableCell>
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14">
            <Image
              src={product.banner_image_url}
              alt={product.name}
              fill
              loading="lazy"
              quality={100}
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
      <TableCell>{product.total_stock}</TableCell>
      <TableCell>{product.product_code || "No Code"}</TableCell>
      <TableCell>
        {product.is_active ? (
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
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
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
