import NotFound from "@/components/NotFound";
import OrdersList from "@/components/order/OrdersList";
import Spinner from "@/components/Spinner";
import { getUserOrders } from "@/lib/api/server/orders";
import { getCurrentUser } from "@/lib/api/server/users";
import { Package } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { user, error: userError } = await getCurrentUser();
  const userId = user?.id;

  const { orders, error: ordersError } = await getUserOrders(userId);

  if (!user || !orders || userError || ordersError) {
    return <NotFound href="/account/orders" title="Orders" />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <div>
          <p className="text-base font-medium">You have no orders yet</p>
          <p className="text-sm text-muted-foreground">
            Browse our products and place an order
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[2.125rem] lg:text-3xl font-bold">Orders</h2>
      <Suspense fallback={<Spinner message="Loading orders..." />}>
        <OrdersList orders={orders} />
      </Suspense>
    </>
  );
}
