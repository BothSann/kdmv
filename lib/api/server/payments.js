import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

export async function getPayment(transactionId) {
  try {
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payment_transactions")
      .select(`*, orders(order_number)`)
      .eq("id", transactionId)
      .single();

    if (paymentError) {
      console.error("Payment fetch error:", paymentError);
      return { error: "Failed to fetch payment" };
    }

    const { data: orderItems, error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", payment.order_id);

    if (orderItemsError) {
      console.error("Order items fetch error:", orderItemsError);
      return { error: "Failed to fetch order items" };
    }

    return { success: true, payment, orderItems };
  } catch (error) {
    console.error("Error fetching payment:", error);
    return { error: "Failed to fetch payment" };
  }
}
