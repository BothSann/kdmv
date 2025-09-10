import Link from "next/link";
import ProductsTable from "@/components/ProductsTable";
import Loading from "./loading";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
export default async function AdminProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
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
