"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";

import Image from "next/image";
import { Checkbox } from "../ui/checkbox";
import { useProductTableStore } from "@/store/useTableSelectionStore";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
export default function CollectionProductSelector({
  products,
  existingProductIds = [],
  isViewMode = false,
  collectionId = null,
}) {
  const {
    selectAll,
    toggleSelectAll,
    toggleItem,
    isSelected,
    clearSelection,
    getSelectedCount,
    initializeSelection,
  } = useProductTableStore();

  const productIds = products.map((product) => product.id);
  const selectedCount = getSelectedCount();

  // Initialize selections with existing products (edit mode) or clear (create mode)
  useEffect(() => {
    if (existingProductIds.length > 0) {
      // Edit mode: pre-select existing products
      initializeSelection(existingProductIds);
    } else {
      // Create mode: clear selections
      clearSelection();
    }
    // NOTE: Zustand store functions are stable, safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, existingProductIds]);

  const handleSelectAll = () => {
    toggleSelectAll(productIds);
  };

  // Handle empty state
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <ShoppingBag size={32} className="text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isViewMode && "No Products in Collection"}
        </h3>

        <p className="text-sm text-muted-foreground max-w-md mb-4">
          {isViewMode &&
            "This collection doesn't have any products yet. You can add products by editing this collection."}
        </p>

        {isViewMode && collectionId && (
          <Button asChild>
            <Link href={`/admin/collections/${collectionId}/edit`}>
              <Plus />
              Add Existing Products
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      {selectedCount > 0 && !isViewMode && (
        <div className="px-4 py-2 bg-muted border border-b-0 border-border">
          <span className="text-xs font-medium">
            {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>
      )}

      <Table className="border">
        <TableHeader className="text-xs">
          <TableRow>
            <TableHead>
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                className={isViewMode ? "hidden" : ""}
              />
            </TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Collection</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => (
            <TableRow className="text-xs" key={product.id}>
              <TableCell>
                <Checkbox
                  checked={isSelected(product.id)}
                  onCheckedChange={() => toggleItem(product.id)}
                  aria-label={`Select ${product.name}`}
                  className={isViewMode ? "hidden" : ""}
                />
              </TableCell>
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
              <TableCell>
                <p>{product.collection_name || "No Collection"}</p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell
              className="text-xs px-4 py-2.5 text-muted-foreground"
              colSpan={3}
            >
              <span className="font-semibold text-foreground">
                {selectedCount}{" "}
              </span>
              item{selectedCount !== 1 ? "s" : ""} in this collection
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
