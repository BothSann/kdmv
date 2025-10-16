import OrderTableClient from "./OrderTableClient";
import { getAllPaidOrders } from "@/lib/api/server/orders";

export default async function OrderTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const { orders, pagination } = await getAllPaidOrders({ page });

  if (!orders || !orders.length) return null;

  return <OrderTableClient orders={orders} pagination={pagination} />;
}
