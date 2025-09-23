"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import Image from "next/image";
import { Checkbox } from "../ui/checkbox";
import useProductTableStore from "@/store/useProductTableStore";
import { useEffect } from "react";
export default function CollectionProductSelector({
  products,
  existingProductIds = [],
  isHidden = false,
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
  }, [products, existingProductIds, initializeSelection, clearSelection]);

  const handleSelectAll = () => {
    toggleSelectAll(productIds);
  };

  return (
    <div>
      {selectedCount > 0 && !isHidden && (
        <div className="px-4 py-2 bg-muted border border-b-0 border-border">
          <span className="text-sm font-medium">
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
                className={isHidden ? "hidden" : ""}
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
                  className={isHidden ? "hidden" : ""}
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
      </Table>
    </div>
  );
}
