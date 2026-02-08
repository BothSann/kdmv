import ProductTableClient from "./ProductTableClient";
import { getAllProducts } from "@/lib/data/products";
import { DEFAULT_PRODUCT_SORT } from "@/lib/constants";

export default async function ProductTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const sortBy = resolvedSearchParams?.sort || DEFAULT_PRODUCT_SORT;
  const searchQuery = resolvedSearchParams?.search || null;

  const { products, pagination } = await getAllProducts({
    page,
    perPage: 10,
    includeDeleted: true,
    sortBy,
    searchQuery,
  });

  return (
    <ProductTableClient
      products={products || []}
      pagination={pagination || { page: 1, perPage: 10, count: 0, totalPages: 0 }}
      currentSearch={searchQuery}
    />
  );
}
