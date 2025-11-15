import NotFound from "@/components/NotFound";
import OrderDetail from "@/components/order/OrderDetail";
import { Button } from "@/components/ui/button";
import { getOrderDetails } from "@/lib/api/orders";
import { getCurrentUser } from "@/lib/api/users";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminOrderDetailPage({ params }) {
  const resolvedParams = await params;
  const { orderId } = resolvedParams;

  const { user } = await getCurrentUser();
  const userId = user?.id;

  const { order, error, role } = await getOrderDetails(orderId, userId);

  if (error || !order) {
    return <NotFound href="/admin/orders" title="Order" />;
  }

  const orderWithAdminId = {
    ...order,
    admin_id: userId, // Current admin user ID
  };

  return (
    <>
      <Header order={order} />
      <OrderDetail order={orderWithAdminId} role={role} />
    </>
  );
}

function Header({ order }) {
  const orderNumber = order.order_number;

  return (
    <div className="flex justify-between items-center mb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/orders">
            <ChevronLeft />
          </Link>
        </Button>
        <h2 className="text-2xl lg:text-3xl font-bold">{orderNumber}</h2>
      </div>
    </div>
  );
}
