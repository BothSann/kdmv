import ProductTableClient from "./ProductTableClient";
import { getAllProducts } from "@/lib/api/products";

export default async function ProductTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const { products, pagination } = await getAllProducts({
    page,
    perPage: 10,
    includeDeleted: true,
  });

  if (!products || !products.length) return null;

  return <ProductTableClient products={products} pagination={pagination} />;
}
