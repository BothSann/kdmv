import OrderItem from "./OrderItem";

export default function OrdersList({ orders }) {
  // console.log("orders", orders);
  return (
    <>
      {orders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </>
  );
}
