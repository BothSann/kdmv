"use server";

import { getBakongProxyUrl, getBaseUrl } from "@/lib/config";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function checkPaymentStatus(transactionId) {
  try {
    // ✅ Use authenticated client - RLS allows customers to view their own payment transactions
    const supabase = await createSupabaseServerClient();
    const { data: transaction, error } = await supabase
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
    const bakongApiUrl = getBakongProxyUrl();
    const paymentCheckResult = await fetch(
      `${bakongApiUrl}/v1/check_transaction_by_md5`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BAKONG_ACCESS_TOKEN}`,
          // Add proxy authentication
          "X-API-Key": process.env.KHQR_PROXY_API_KEY,
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
    // ⚠️ This is a SYSTEM operation (payment callback handler)
    // We use supabaseAdmin to bypass RLS as this is triggered by Bakong webhook
    // NOT by customer action directly

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
        payment_status: "PAID",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("*, order_items(*)")
      .single();

    // ✅ Use supabaseAdmin for RPC system operations (inventory management)
    // Decrease stock for all order items in a single batch operation
    const variantIds = order.order_items.map((item) => item.product_variant_id);
    const quantities = order.order_items.map((item) => item.quantity);

    await supabaseAdmin.rpc("decrement_multiple_product_variants", {
      variant_ids: variantIds,
      quantities: quantities,
    });

    // Record coupon usage if applicable
    if (order.promo_code_id) {
      await supabaseAdmin.from("promo_code_usage").insert({
        promo_code_id: order.promo_code_id,
        customer_id: order.customer_id,
        order_id: order.id,
      });

      // ✅ Use supabaseAdmin for RPC system operations (promo code tracking)
      // Increment total_uses
      await supabaseAdmin.rpc("increment_promo_code_usage", {
        promo_code_id: order.promo_code_id,
      });
    }

    // Clear customer's cart
    await supabaseAdmin
      .from("shopping_cart")
      .delete()
      .eq("customer_id", order.customer_id);

    // Create status history
    // await supabaseAdmin.from("order_status_history").insert({
    //   order_id: orderId,
    //   status: "CONFIRMED",
    //   notes: "Payment completed successfully",
    //   changed_by: order.customer_id,
    // });

    revalidatePath("/checkouts");
    return { success: true };
  } catch (error) {
    console.error("Error confirming order payment:", error);
    return { error: "Failed to confirm order" };
  }
}
