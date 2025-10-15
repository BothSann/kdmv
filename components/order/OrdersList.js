import OrderItem from "./OrderItem";

export default function OrdersList({ orders }) {
  return (
    <>
      {orders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </>
  );
}
