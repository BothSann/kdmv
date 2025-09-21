"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shapes, TicketPercent } from "lucide-react";
import Link from "next/link";
import { Pencil, Trash2, View } from "lucide-react";
import { useState } from "react";
import DeleteCouponDialog from "./DeleteCouponDialog";
import { cn } from "@/lib/utils";

export default function CollectionRow({ collection }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <TableRow className="text-sm">
      <TableCell className="flex items-center gap-2.5">
        <div className="bg-chart-4 rounded-full p-2">
          <Shapes size={22} className="text-background dark:text-foreground" />
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

        <DeleteCouponDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          collection={collection}
        />
      </TableCell>
    </TableRow>
  );
}
