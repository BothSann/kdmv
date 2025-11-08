"use server";

import { validateCartStock } from "@/lib/api/carts";
import { decodeKHQR, generateIndividualKHQR } from "@/lib/bakong-khqr";
import {
  getOrderById,
  updateOrder,
  addOrderStatusHistory,
} from "@/lib/api/orders";

import {
  generateUniqueOrderNumber,
  generateStatusChangeNote,
} from "@/lib/utils";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function createOrderAndInitiatePaymentAction(orderData) {
  try {
    // PHASE 1: VALIDATE
    if (!orderData.cartItems || orderData.cartItems.length === 0) {
      return { error: "Cart is empty" };
    }

    if (!orderData.customerId) {
      return { error: "User is not authenticated" };
    }

    // Validate stock
    const stockValidation = await validateCartStock(orderData.cartItems);
    if (!stockValidation.valid) {
      return {
        error: `Stock validation failed: ${stockValidation.error}`,
        outOfStock: stockValidation.outOfStockItems,
      };
    }

    // PHASE 2: CREATE ORDER (PENDING)
    const orderNumber = generateUniqueOrderNumber();

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: orderData.customerId,
        status: "PENDING",
        subtotal: orderData.subtotal,
        discount_amount: orderData.discountAmount,
        total_amount: orderData.totalAmount,
        promo_code_id: orderData.promoCodeId,
        payment_method: orderData.paymentMethod,
        payment_status: "PENDING",
        shipping_address: orderData.shippingAddress,
        notes: orderData.notes || null,
        currency: orderData.currency || "USD",
      })
      .single()
      .select();

    if (orderError) {
      console.error("Order error:", orderError);
      return { error: orderError.message };
    }

    // PHASE 3: CREATE ORDER ITEMS
    const orderItems = orderData.cartItems.map((item) => {
      const product = item.variant.product;
      const variant = item.variant;

      // Calculate item price (base_price - discount)
      const unitPrice = product.base_price;
      const discountPercentage = product.discount_percentage || 0;
      const totalPrice =
        item.quantity * (unitPrice * (1 - discountPercentage / 100));

      return {
        order_id: order.id,
        product_id: product.id,
        product_variant_id: variant.id,
        product_name: product.name,
        color_id: variant.colors.id,
        size_id: variant.sizes.id,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount_percentage: discountPercentage,
        total_price: totalPrice,
      };
    });

    const { data: createdOrderItems, error: orderItemsError } =
      await supabaseAdmin.from("order_items").insert(orderItems).select();

    if (orderItemsError) {
      console.error("Order items creation error:", orderItemsError);

      // Rollback: Delete the order we just created
      await supabaseAdmin.from("orders").delete().eq("id", order.id);

      return { error: "Failed to create order items" };
    }

    // PHASE 4: GENERATE KHQR PAYMENT
    // Generate KHQR with order total amount
    const khqrResult = generateIndividualKHQR(order.total_amount);
    if (!khqrResult || !khqrResult.data) {
      // Rollback
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return { error: "Failed to generate KHQR payment" };
    }

    const qrString = khqrResult.data.qr; // For QR code display
    const md5Hash = khqrResult.data.md5; // For payment verification

    // Decode KHQR to get payment details (optional, for display)
    const decodedKHQR = decodeKHQR(qrString);

    const { data: paymentTransaction, error: paymentError } =
      await supabaseAdmin
        .from("payment_transactions")
        .insert({
          order_id: order.id,
          gateway: "BAKONG_KHQR",
          type: "PURCHASE",
          amount: order.total_amount,
          currency: order.currency,
          status: "INITIATED",
          qr_string: qrString,
          hash: md5Hash,
          gateway_request: khqrResult,
          gateway_response: decodedKHQR,
          expires_at: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 min expiry
        })
        .select()
        .single();

    if (paymentError) {
      console.error("Payment transaction error:", paymentError);
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return { error: "Failed to create payment transaction" };
    }

    // PHASE 6: CREATE ORDER STATUS HISTORY
    await supabaseAdmin.from("order_status_history").insert({
      order_id: order.id,
      status: "PENDING",
      notes: "Order has been placed",
      changed_by: orderData.customerId,
    });

    // PHASE 7: RETURN SUCCESS WITH PAYMENT DATA

    return {
      success: true,
      message: "Please scan the QR code to pay",
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        currency: order.currency,
      },
      paymentData: {
        transactionId: paymentTransaction.id,
        qrString: qrString,
        md5Hash: md5Hash,
        decodedInfo: decodedKHQR,
        expiresAt: paymentTransaction.expires_at,
      },
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { error: "An unexpected error occurred during order creation" };
  }
}

export async function updateOrderStatusAction(
  orderId,
  newStatus,
  notes = "",
  adminId
) {
  try {
    // STEP 1: Validate status
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    // STEP 2: Get current order (for validation)
    const { data: currentOrder, error: fetchError } = await getOrderById(
      orderId
    );

    if (fetchError) {
      console.error("Order fetch error:", fetchError);
      return { error: "Failed to fetch order" };
    }

    if (!validStatuses.includes(newStatus)) {
      return { error: "Invalid order status" };
    }

    // Prevent redundant updates
    if (currentOrder.status === newStatus) {
      return { error: `Order is already ${newStatus}` };
    }

    // STEP 3: Update orders.status (CURRENT STATE) ✅
    const { data: updatedOrder, error: updateError } = await updateOrder(
      orderId,
      {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }
    );

    if (updateError) {
      return { error: updateError };
    }

    // STEP 4: Insert into order_status_history (AUDIT TRAIL)
    const defaultNotes =
      notes || generateStatusChangeNote(currentOrder.status, newStatus);
    const { error: historyError } = await addOrderStatusHistory(
      orderId,
      newStatus,
      defaultNotes,
      adminId
    );

    if (historyError) {
      console.error("History insert error:", historyError);
      // Don't fail the whole operation - history is optional
    }

    // STEP 5: Revalidate the order detail page
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);

    return {
      success: true,
      message: `Order status updated to ${newStatus}`,
      order: updatedOrder,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { error: "Failed to update order status" };
  }
}
