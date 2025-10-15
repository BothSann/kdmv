import NotFound from "@/components/NotFound";
import OrdersList from "@/components/order/OrdersList";
import Spinner from "@/components/Spinner";
import { getUserOrders } from "@/lib/api/server/orders";
import { getCurrentUser } from "@/lib/api/server/users";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { user, error: userError } = await getCurrentUser();
  const userId = user?.id;

  const { orders, error: ordersError } = await getUserOrders(userId);

  if (!user || !orders || userError || ordersError) {
    return <NotFound href="/account/orders" title="Orders" />;
  }

  return (
    <>
      <h2 className="text-3xl font-bold">Orders</h2>
      <Suspense fallback={<Spinner message="Loading orders..." />}>
        <OrdersList orders={orders} />
      </Suspense>
    </>
  );
}
