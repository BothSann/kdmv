import Link from "next/link";
import { Suspense } from "react";

import { UsersTable } from "@/components/admin/users";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import TableSkeleton from "@/components/TableSkeleton";
import PaginationStateManager from "@/components/PaginationStateManager";

export default function UsersManagementPage({ searchParams }) {
  return (
    <>
      <PaginationStateManager />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage users in the store
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/users/create">
            <Plus />
            Create Admin
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <UsersTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}
