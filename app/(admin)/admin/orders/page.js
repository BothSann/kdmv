import OrderTable from "@/components/order/OrderTable";
import TableSkeleton from "@/components/TableSkeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

export default function OrdersPage() {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Orders</h1>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <OrderTable />
      </Suspense>
    </>
  );
}
