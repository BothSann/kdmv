import OrderDetail from "@/components/order/OrderDetail";

import { getOrderDetails } from "@/lib/api/server/orders";
import { getCurrentUser } from "@/lib/api/server/users";

import NotFound from "@/components/NotFound";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { orderId } = resolvedParams;

  const { user } = await getCurrentUser();
  const userId = user?.id;

  const { order, error } = await getOrderDetails(orderId, userId);

  if (error || !order) {
    return {
      title: "Order Not Found",
    };
  }

  return {
    title: `Order | ${order.order_number}`,
  };
}

export default async function OrderDetailPage({ params }) {
  const resolvedParams = await params;
  const { orderId } = resolvedParams;

  const { user } = await getCurrentUser();
  const userId = user?.id;

  const { order, error } = await getOrderDetails(orderId, userId);

  if (error || !order) {
    return <NotFound href="/account/orders" title="Order" />;
  }

  return (
    <>
      <Header />
      <OrderDetail order={order} />
    </>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Link href="/account/orders">
        <Button variant="outline">
          <ChevronLeft />
        </Button>
      </Link>
      <h2 className="text-3xl font-bold">Order Details</h2>
    </div>
  );
}
