import Link from "next/link";
import ProductTable from "@/components/product/ProductTable";
import PaginationStateManager from "@/components/PaginationStateManager";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings2 } from "lucide-react";
import ProductTableSkeleton from "@/components/TableSkeleton";

export default async function AdminProductsPage({ searchParams }) {
  return (
    <>
      <PaginationStateManager />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage products in the store
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/products/attributes">
              <Settings2 />
              Attributes
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/create">
              <Plus />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<ProductTableSkeleton />}>
        <ProductTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}
