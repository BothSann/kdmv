import { Suspense } from "react";
import { getPayment } from "@/lib/api/server/payments";

import NotFound from "@/components/NotFound";
import OrderSuccessCard from "@/components/OrderSuccessCard";
import Spinner from "@/components/Spinner";

export default async function CheckoutsSuccessPage({ params }) {
  const resolvedParams = await params;
  const { payment, orderItems, error } = await getPayment(
    resolvedParams.transactionId
  );

  if (!payment || !orderItems || error) {
    return <NotFound href="/checkouts" title="Order" />;
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
