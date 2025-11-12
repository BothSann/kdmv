"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SpinnerV2 from "@/components/SpinnerV2";
import { createOrderAndInitiatePaymentAction } from "@/server/actions/order-action";
import { formatCurrency } from "@/lib/utils";
import useCartStore from "@/store/useCartStore";

/**
 * Client Component - Order summary and checkout button
 */
export default function OrderSummarySection({
  items,
  appliedCoupon,
  selectedAddress,
  paymentMethod,
  userId,
  onPaymentInitiated,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Get calculations from cart store (single source of truth)
  // Use individual selectors to prevent infinite loops from object references
  const itemCount = useCartStore((state) => state.itemCount());
  const subtotal = useCartStore((state) => state.subTotalPrice());
  const itemDiscounts = useCartStore((state) => state.itemDiscountAmount());
  const couponDiscount = useCartStore((state) =>
    state.couponDiscountAmount(appliedCoupon)
  );
  const finalTotal = useCartStore((state) => state.finalTotal(appliedCoupon));

  const handleCheckout = async () => {
    // Validation
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        // Customer info
        customerId: userId,

        // Items from cart
        cartItems: items,

        // Payment info
        paymentMethod: paymentMethod,

        // Pricing
        subtotal: subtotal,
        discountAmount: itemDiscounts + couponDiscount,
        totalAmount: finalTotal,

        // Promo code
        promoCodeId: appliedCoupon?.id || null,

        // Shipping address
        shippingAddress: {
          fullName: `${selectedAddress.first_name} ${selectedAddress.last_name}`,
          streetAddress: selectedAddress.street_address,
          apartment: selectedAddress.apartment || "",
          cityProvince: selectedAddress.city_province,
          country: selectedAddress.country,
          telephone: selectedAddress.phone_number,
        },
      };

      // Create order and initiate payment
      const result = await createOrderAndInitiatePaymentAction(orderData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(result.message);
        // Notify parent to show payment modal
        onPaymentInitiated(result.paymentData, result.order.id);
      }
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error("Error checking out. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2.5 font-poppins">Order Summary</h2>

      <Card>
        <CardContent className="space-y-2.5">
          {/* Subtotal */}
          <div className="flex items-center justify-between gap-4 text-sm lg:text-base">
            <span className="text-muted-foreground">
              Subtotal ({itemCount})
            </span>
            <span className="font-jost">{formatCurrency(subtotal)}</span>
          </div>

          {/* Item Discounts */}
          <div className="flex items-center justify-between gap-4 text-sm lg:text-base">
            <span className="text-muted-foreground">Save (Item Discounts)</span>
            <span className="font-jost">
              &minus;{formatCurrency(itemDiscounts)}
            </span>
          </div>

          {/* Delivery Fee */}
          <div className="flex items-center justify-between mb-4 gap-4 text-sm lg:text-base">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-jost">{formatCurrency(0)}</span>
          </div>

          {/* Coupon Discount */}
          {appliedCoupon && (
            <div className="flex items-center justify-between gap-4 text-success mb-4 text-sm">
              <span>Coupon Applied ({appliedCoupon.code})</span>
              <span className="font-medium">
                &minus;{formatCurrency(couponDiscount)}
              </span>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <span className="text-xl font-semibold">Total</span>
            <span className="text-xl font-semibold font-jost">
              {formatCurrency(finalTotal)}
            </span>
          </div>

          {/* Checkout Button */}
          <Button
            className="w-full py-6 mt-4 text-base font-semibold flex items-center gap-4"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <SpinnerV2 />
                Processing payment...
              </>
            ) : (
              "Checkout"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
