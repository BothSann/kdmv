import Link from "next/link";
import ProductTable from "@/components/product/ProductTable";
import PaginationStateManager from "@/components/PaginationStateManager";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductTableSkeleton from "@/components/TableSkeleton";

export default async function AdminProductsPage({ searchParams }) {
  return (
    <>
      <PaginationStateManager />
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/create">
            <Plus />
            Add Product
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ProductTableSkeleton />}>
        <ProductTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}
