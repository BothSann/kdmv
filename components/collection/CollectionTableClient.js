"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableFooter,
} from "@/components/ui/table";
import CollectionRow from "./CollectionRow";
import Pagination from "../Pagination";
import { Checkbox } from "../ui/checkbox";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Trash2, X } from "lucide-react";
import { MoreVertical } from "lucide-react";
import { useCollectionTableStore } from "@/store/useTableSelectionStore";
import { useEffect, useState } from "react";
import BulkDeleteCollectionDialog from "./BulkDeleteCollectionDialog";

export default function CollectionTableClient({ collections, pagination }) {
  const tableHeaders = [
    { key: "select", label: "Select" },
    { key: "name", label: "Collection Name" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  const {
    selectAll,
    selectedItems,
    toggleSelectAll,
    getSelectedCount,
    clearSelection,
  } = useCollectionTableStore();
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const collectionIds = collections.map((collection) => collection.id);
  const selectedCount = getSelectedCount();

  useEffect(() => {
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections]);

  const handleSelectAll = () => {
    toggleSelectAll(collectionIds);
  };

  return (
    <div>
      {selectedCount > 0 && (
        <div className="px-4 py-2 bg-muted/50 border border-border mt-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedCount} collection{selectedCount !== 1 ? "s" : ""}{" "}
              selected
            </span>

            <div className="flex gap-4 items-center">
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X />
                Clear Selection
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  size="sm"
                  className="flex cursor-pointer items-center text-sm font-medium"
                >
                  <MoreVertical />
                  Actions
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                  >
                    <Trash2 />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <BulkDeleteCollectionDialog
                isOpen={isBulkDeleteDialogOpen}
                onClose={() => setIsBulkDeleteDialogOpen(false)}
                collectionIds={selectedItems}
                redirectTo="/admin/collections"
              />
            </div>
          </div>
        </div>
      )}

      <Table className="mt-10 border rounded-lg">
        <TableHeader>
          <TableRow>
            {tableHeaders.map((header, index) => (
              <TableHead
                key={header.key}
                className={cn(header.key === "select" && "w-10")}
              >
                {header.key === "select" ? (
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all collections"
                  />
                ) : (
                  header.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <CollectionRow key={collection.id} collection={collection} />
          ))}
        </TableBody>

        {pagination && (
          <TableFooter>
            <Pagination
              pagination={pagination}
              totalColumns={tableHeaders.length}
            />
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
