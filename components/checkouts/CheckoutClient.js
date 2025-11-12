"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";

import useCartStore from "@/store/useCartStore";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";

// Import section components
import DeliveryAddressSection from "./DeliveryAddressSection";
import CartItemsSection from "./CartItemsSection";
import PaymentMethodSection from "./PaymentMethodSection";
import CouponSection from "./CouponSection";
import OrderSummarySection from "./OrderSummarySection";
import PaymentModal from "./PaymentModal";

/**
 * Main Client Wrapper - Manages checkout state and coordinates all sections
 */
export default function CheckoutClient({
  initialAddresses,
  initialSelectedAddress,
  userId,
}) {
  // Cart state from Zustand - use selectors to prevent infinite loops
  const items = useCartStore((state) => state.items);
  const isLoading = useCartStore((state) => state.isLoading);
  const hasHydrated = useCartStore((state) => state._hasHydrated);

  // Track if component has mounted (to prevent spinner on tab switch)
  const hasInitiallyLoaded = useRef(false);

  // Local state for checkout flow
  const [addresses] = useState(initialAddresses);
  const [selectedAddress, setSelectedAddress] = useState(
    initialSelectedAddress
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("bakong_khqr");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Mark as loaded once hydrated
  useEffect(() => {
    if (hasHydrated) {
      hasInitiallyLoaded.current = true;
    }
  }, [hasHydrated]);

  // Handler for payment initiation
  const handlePaymentInitiated = (data, orderIdValue) => {
    setPaymentData(data);
    setOrderId(orderIdValue);
    setShowPaymentModal(true);
  };

  // Handler for modal close
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
    setOrderId(null);
  };

  // ONLY show spinner on INITIAL load (not on tab switch)
  if (!hasHydrated) {
    return <Spinner message="Loading checkout..." />;
  }

  // Show empty state if no items in cart
  if (items.length === 0) {
    return (
      <EmptyState
        className="min-h-[calc(100dvh-10rem)]"
        icon={ShoppingCart}
        title="Your cart is empty"
        description="Check out our latest arrivals and stay up-to-date with latest styles"
        action={{ href: "/products", label: "Continue Shopping" }}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-10 font-poppins">
        {/* LEFT COLUMN */}
        <div className="space-y-10 pr-0 lg:pr-10 border-none lg:border-r lg:border-border">
          {/* Delivery Address Section */}
          <DeliveryAddressSection
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelectAddress={setSelectedAddress}
            isLoading={false} // Already loaded server-side
          />

          {/* Cart Items Section (Server Component) */}
          <CartItemsSection items={items} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-10 pl-0 lg:pl-10">
          {/* Payment Method Section */}
          <PaymentMethodSection
            selected={selectedPaymentMethod}
            onSelect={setSelectedPaymentMethod}
          />

          {/* Coupon Section */}
          <CouponSection
            userId={userId}
            appliedCoupon={appliedCoupon}
            onCouponApplied={setAppliedCoupon}
          />

          {/* Order Summary Section */}
          <OrderSummarySection
            items={items}
            appliedCoupon={appliedCoupon}
            selectedAddress={selectedAddress}
            paymentMethod={selectedPaymentMethod}
            userId={userId}
            onPaymentInitiated={handlePaymentInitiated}
          />
        </div>
      </div>

      {/* Payment Modal (conditionally rendered) */}
      {showPaymentModal && paymentData && (
        <PaymentModal
          paymentData={paymentData}
          orderId={orderId}
          onClose={handleClosePaymentModal}
        />
      )}
    </>
  );
}
