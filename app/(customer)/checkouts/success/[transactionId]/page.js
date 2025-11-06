import { Suspense } from "react";
import { getPayment, getPaymentWithOwnership } from "@/lib/api/server/payments";

import NotFound from "@/components/NotFound";
import OrderSuccessCard from "@/components/OrderSuccessCard";
import Spinner from "@/components/Spinner";
import { getCurrentUser } from "@/lib/api/server/users";
import { redirect } from "next/navigation";

export default async function CheckoutsSuccessPage({ params }) {
  const resolvedParams = await params;

  const { user } = await getCurrentUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const { payment, orderItems, error } = await getPaymentWithOwnership(
    resolvedParams.transactionId,
    user.id
  );

  if (!payment || !orderItems || error) {
    return <NotFound href="/" title="Order" />;
  }

  const orderNumber = payment.orders.order_number;
  const totalAmount = payment.amount;
  const date = payment.completed_at;
  const totalItems = orderItems.length;
  const status = payment.status;

  return (
    <Suspense fallback={<Spinner />}>
      <OrderSuccessCard
        orderNumber={orderNumber}
        totalItems={totalItems}
        totalAmount={totalAmount}
        date={date}
        status={status}
      />
    </Suspense>
  );
}
