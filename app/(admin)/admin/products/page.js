import Link from "next/link";
import ProductsTable from "@/components/ProductsTable";
import Loading from "./loading";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
export default async function AdminProductsPage() {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button asChild>
          <Link href="/admin/products/create">
            <Plus />
            <span>Add Product</span>
          </Link>
        </Button>
      </div>

      <Suspense fallback={<Loading />}>
        <ProductsTable />
      </Suspense>
    </div>
  );
}
