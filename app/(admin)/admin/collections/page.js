import CollectionTable from "@/components/collection/CollectionTable";
import PaginationStateManager from "@/components/PaginationStateManager";
import TableSkeleton from "@/components/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function AdminCollectionsPage({ searchParams }) {
  return (
    <>
      <PaginationStateManager />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Collections</h1>
          <p className="text-muted-foreground mt-1">
            Manage collections in the store
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/collections/create">
            <Plus />
            Create Collection
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <CollectionTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}
