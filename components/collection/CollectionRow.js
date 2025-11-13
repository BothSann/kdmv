"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shapes } from "lucide-react";
import Link from "next/link";
import { Pencil, Trash2, View } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import DeleteCollectionDialog from "./DeleteCollectionDialog";

import { Checkbox } from "../ui/checkbox";
import { useCollectionTableStore } from "@/store/useTableSelectionStore";
import Image from "next/image";

export default function CollectionRow({ collection }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toggleItem, isSelected } = useCollectionTableStore();
  console.log(collection);
  console.log(collection.banner_image_url);

  return (
    <TableRow className="text-sm">
      <TableCell>
        <Checkbox
          checked={isSelected(collection.id)}
          onCheckedChange={() => toggleItem(collection.id)}
          aria-label={`Select ${collection.name}`}
        />
      </TableCell>
      <TableCell className="flex items-center gap-2.5">
        <div className="relative w-10 h-10">
          {collection.banner_image_url ? (
            <Image
              src={collection.banner_image_url}
              alt={collection.name}
              fill
              loading="lazy"
              quality={50}
              sizes="100vw"
              className="object-cover object-top rounded-full"
            />
          ) : (
            <div className="w-full h-full bg-chart-4 rounded-full flex items-center justify-center">
              <Shapes
                size={22}
                className="text-background dark:text-foreground"
              />
            </div>
          )}
        </div>
        <span>{collection.name}</span>
      </TableCell>
      <TableCell
        className={cn(
          collection.is_active ? "text-success" : "text-destructive"
        )}
      >
        {collection.is_active ? "Active" : "Inactive"}
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={`/admin/collections/${collection.id}`}>
                <View />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/collections/${collection.id}/edit`}>
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

        <DeleteCollectionDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          collection={collection}
          redirectTo="/admin/collections"
        />
      </TableCell>
    </TableRow>
  );
}
