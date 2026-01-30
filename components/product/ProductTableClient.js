"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreVertical, Package, Trash2, X } from "lucide-react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableFooter,
} from "@/components/ui/table";
import ProductRow from "./ProductRow";
import Pagination from "../Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BulkDeleteProductDialog from "./BulkDeleteProductDialog";
import { useProductTableStore } from "@/store/useTableSelectionStore";
import EmptyState from "../EmptyState";
import SortSelect from "@/components/ui/sort-select";
import {
  PRODUCT_SORT_OPTIONS,
  DEFAULT_PRODUCT_SORT,
} from "@/lib/constants";

export default function ProductTableClient({ products, pagination }) {
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const {
    selectedItems,
    selectAll,
    toggleSelectAll,
    clearSelection,
    getSelectedCount,
  } = useProductTableStore();

  // Clear selections when products change (page navigation)
  useEffect(() => {
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // Get product IDs for toggle all functionality
  const productIds = products.map((product) => product.id);
  const selectedCount = getSelectedCount();

  const handleSelectAll = () => {
    toggleSelectAll(productIds);
  };

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products yet"
        description="Create your first product to display in the store"
      />
    );
  }

  const tableHeaders = [
    { label: "", key: "select" }, // Checkbox column
    { label: "Product Name", key: "name" },
    { label: "Base Price", key: "base_price" },
    { label: "Discount", key: "discount_percentage" },
    { label: "Type / Gender", key: "product_type_name" },
    { label: "Collection", key: "collection_name" },
    { label: "Stock", key: "total_stock" },
    { label: "Code", key: "product_code" },
    { label: "Status", key: "is_active" },
    { label: "Actions", key: "actions" },
  ];

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex justify-end mt-6">
        <SortSelect
          options={PRODUCT_SORT_OPTIONS}
          defaultValue={DEFAULT_PRODUCT_SORT}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="px-4 py-2 bg-muted/50 border border-border mt-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedCount} product{selectedCount !== 1 ? "s" : ""} selected
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

              <BulkDeleteProductDialog
                isOpen={isBulkDeleteDialogOpen}
                onClose={() => setIsBulkDeleteDialogOpen(false)}
                productIds={selectedItems}
                redirectTo="/admin/products"
              />
            </div>
          </div>
        </div>
      )}

      <Table className="mt-10 border">
        <TableHeader>
          <TableRow>
            {tableHeaders.map((header, index) => (
              <TableHead
                // className={cn("py-3.5", index === 0 && "pl-4")}
                key={header.key}
              >
                {header.key === "select" ? (
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all products"
                  />
                ) : (
                  header.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </TableBody>

        <TableFooter>
          <Pagination
            pagination={pagination}
            totalColumns={tableHeaders.length}
          />
        </TableFooter>
      </Table>
    </div>
  );
}
