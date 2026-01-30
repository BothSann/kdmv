import NotFound from "@/components/NotFound";
import OrderTableClient from "./OrderTableClient";
import { getAllOrders } from "@/lib/data/orders";
import EmptyState from "../EmptyState";
import { FileCheck } from "lucide-react";

export default async function OrderTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const status = resolvedSearchParams?.status || null;
  const paymentStatus = resolvedSearchParams?.paymentStatus || null;
  const searchQuery = resolvedSearchParams?.search || null;

  const { orders, pagination } = await getAllOrders({
    page,
    status,
    paymentStatus,
    searchQuery,
  });

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon={FileCheck}
        title="No orders yet"
        description="Create your first order to display in the store"
      />
    );
  }

  return <OrderTableClient orders={orders} pagination={pagination} />;
}
