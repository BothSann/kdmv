import Link from "next/link";
import ProductTable from "@/components/ProductTable";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Spinner from "@/components/Spinner";
export default async function AdminProductsPage() {
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

      <Suspense fallback={<Spinner />}>
        <ProductTable />
      </Suspense>
    </div>
  );
}
