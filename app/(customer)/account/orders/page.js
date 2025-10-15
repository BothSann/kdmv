import OrdersList from "@/components/order/OrdersList";
import Spinner from "@/components/Spinner";
import { getUserOrders } from "@/lib/api/server/orders";
import { getCurrentUser } from "@/lib/api/server/users";
import { Suspense } from "react";

export default async function OrdersPage() {
  const { user } = await getCurrentUser();
  const userId = user?.id;

  const result = await getUserOrders(userId);
  const { orders } = result;

  return (
    <>
      <h2 className="text-3xl font-bold">Orders</h2>
      <Suspense fallback={<Spinner message="Loading orders..." />}>
        <OrdersList orders={orders} />
      </Suspense>
    </>
  );
}
