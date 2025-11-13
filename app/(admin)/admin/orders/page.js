import OrderTable from "@/components/order/OrderTable";
import PaginationStateManager from "@/components/PaginationStateManager";
import TableSkeleton from "@/components/TableSkeleton";
import { Suspense } from "react";

export default function AdminOrdersPage({ searchParams }) {
  return (
    <>
      <PaginationStateManager />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage orders in the store
          </p>
        </div>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <OrderTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}
