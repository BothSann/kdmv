import OrderTable from "@/components/order/OrderTable";
import PaginationStateManager from "@/components/PaginationStateManager";
import TableSkeleton from "@/components/TableSkeleton";
import { Suspense } from "react";

export default function OrdersPage({ searchParams }) {
  return (
    <>
      <PaginationStateManager />
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Orders</h1>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <OrderTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}
