import EmptyState from "@/components/EmptyState";
import NotFound from "@/components/NotFound";
import OrdersList from "@/components/order/OrdersList";
import Spinner from "@/components/Spinner";
import { getUserOrders } from "@/lib/api/orders";
import { getCurrentUser } from "@/lib/api/users";
import { Package } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "KDMV | Orders",
  description: "View your orders and track your purchases",
};

export default async function OrdersPage() {
  const { user, error: userError } = await getCurrentUser();
  const userId = user?.id;

  const { orders, error: ordersError } = await getUserOrders(userId);

  if (!user || !orders || userError || ordersError) {
    return <NotFound href="/account/orders" title="Orders" />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="You have no orders yet"
        description="Browse our products and place an order"
      />
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
