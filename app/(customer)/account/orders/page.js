import OrdersList from "@/components/order/OrdersList";
import { getUserOrders } from "@/lib/api/server/orders";
import { getCurrentUser } from "@/lib/api/server/users";

export default async function OrdersPage() {
  const { user } = await getCurrentUser();
  const userId = user?.id;

  const result = await getUserOrders(userId);
  const { orders } = result;

  return (
    <>
      <h2 className="text-2xl font-semibold">Orders</h2>
      <OrdersList orders={orders} />
    </>
  );
}
