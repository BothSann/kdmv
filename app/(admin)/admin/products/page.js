import { Button } from "@/components/ui/button";

import Link from "next/link";
import ProductsTable from "@/components/ProductsTable";
import { Suspense } from "react";
import Loading from "./loading";

export default async function AdminProductsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h2>Products</h2>
        <Button asChild>
          <Link href="/admin/products/create">Add Product</Link>
        </Button>
      </div>

      <Suspense fallback={<Loading />}>
        <ProductsTable />
      </Suspense>
    </div>
  );
}
