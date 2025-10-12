"use server";

import { getBaseUrl } from "@/lib/config";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function checkPaymentStatus(transactionId) {
  try {
    // Fetch transaction details
    const { data: transaction, error } = await supabaseAdmin
      .from("payment_transactions")
      .select("*, orders(*)")
      .eq("id", transactionId)
      .single();

    if (error || !transaction) {
      return { error: "Transaction not found" };
    }

    // Check if already processed
    if (transaction.status === "COMPLETED") {
      return { status: "COMPLETED", transaction };
    }

    // Call Bakong API to check payment status using MD5
    const md5Hash = transaction.hash;
    const paymentCheckResult = await fetch(
      `${process.env.BAKONG_API_URL}/v1/check_transaction_by_md5`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BAKONG_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ md5: md5Hash }),
      }
    );

    const paymentStatus = await paymentCheckResult.json();

    if (paymentStatus.responseCode === 0 && paymentStatus.data?.hash) {
      // Payment successful - confirm order
      await confirmOrderPayment(
        transaction.order_id,
        transactionId,
        paymentStatus
      );

      revalidatePath(`/checkouts/success/${transactionId}`);
      return {
        status: "COMPLETED",
        transaction,
        message: "Payment confirmed successfully",
      };
    } else {
      // Payment still pending or failed
      return { status: transaction.status, transaction };
    }
  } catch (error) {
    console.error("Error checking payment status:", error);
    return { error: "Failed to check payment status" };
  }
}

export async function confirmOrderPayment(
  orderId,
  transactionId,
  paymentResponse
) {
  try {
    // Update payment transaction
    await supabaseAdmin
      .from("payment_transactions")
      .update({
        status: "COMPLETED",
        completed_at: new Date().toISOString(),
        callback_data: paymentResponse,
      })
      .eq("id", transactionId);

    // Update order status
    const { data: order } = await supabaseAdmin
      .from("orders")
      .update({
        status: "CONFIRMED",
        payment_status: "PAID",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("*, order_items(*)")
      .single();

    // Decrease stock for each order item
    for (const item of order.order_items) {
      await supabaseAdmin.rpc("decrement_product_variant_quantity", {
        variant_id: item.product_variant_id,
        quantity_to_subtract: item.quantity,
      });
    }

    // Record coupon usage if applicable
    if (order.promo_code_id) {
      await supabaseAdmin.from("promo_code_usage").insert({
        promo_code_id: order.promo_code_id,
        customer_id: order.customer_id,
        order_id: order.id,
      });

      // Increment total_uses
      await supabaseAdmin.rpc("increment_promo_code_usage", {
        code_id: order.promo_code_id,
      });
    }

    // Clear customer's cart
    await supabaseAdmin
      .from("shopping_cart")
      .delete()
      .eq("customer_id", order.customer_id);

    // Create status history
    await supabaseAdmin.from("order_status_history").insert({
      order_id: orderId,
      status: "CONFIRMED",
      notes: "Payment completed successfully",
      changed_by: order.customer_id,
    });

    revalidatePath("/checkouts");
    return { success: true };
  } catch (error) {
    console.error("Error confirming order payment:", error);
    return { error: "Failed to confirm order" };
  }
}
