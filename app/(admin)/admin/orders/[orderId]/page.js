import NotFound from "@/components/NotFound";
import OrderDetail from "@/components/order/OrderDetail";
import { Button } from "@/components/ui/button";
import { getOrderDetails } from "@/lib/api/server/orders";
import { getCurrentUser } from "@/lib/api/server/users";
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

  return (
    <>
      <Header order={order} />
      <OrderDetail order={order} role={role} />
    </>
  );
}

function Header({ order }) {
  return (
    <div className="flex justify-between items-center mb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/orders">
            <ChevronLeft />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold">{order.order_number}</h2>
      </div>
    </div>
  );
}
