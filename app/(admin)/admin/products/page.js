import Link from "next/link";
import ProductTable from "@/components/ProductTable";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductTableSkeleton from "@/components/ProductTableSkeleton";
export default async function AdminProductsPage({ searchParams }) {
  return (
    <div>
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
    </div>
  );
}
