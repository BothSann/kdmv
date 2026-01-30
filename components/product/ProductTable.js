import EmptyState from "../EmptyState";
import ProductTableClient from "./ProductTableClient";
import { getAllProducts } from "@/lib/data/products";
import { Package } from "lucide-react";
import { DEFAULT_PRODUCT_SORT } from "@/lib/constants";

export default async function ProductTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const sortBy = resolvedSearchParams?.sort || DEFAULT_PRODUCT_SORT;

  const { products, pagination } = await getAllProducts({
    page,
    perPage: 10,
    includeDeleted: true,
    sortBy,
  });

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products yet"
        description="Create your first product to display in the store"
      />
    );
  }

  return <ProductTableClient products={products} pagination={pagination} />;
}
