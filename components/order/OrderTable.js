import NotFound from "@/components/NotFound";
import OrderTableClient from "./OrderTableClient";
import { getAllOrders } from "@/lib/api/server/orders";

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

  if (!orders.length) return null;

  return <OrderTableClient orders={orders} pagination={pagination} />;
}
