"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// 2. Third-party libraries
import { toast } from "sonner";
import { ShoppingCart, TicketCheck } from "lucide-react";

// 3. UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// 4. Custom Components
import CheckoutItem from "@/components/CheckoutItem";
import Spinner from "@/components/Spinner";
import SpinnerV2 from "@/components/SpinnerV2";
import BakongKHQRModal from "@/components/BakongKHQRModal";

// 5. Store/State Management
import useCartStore from "@/store/useCartStore";
import useAuthStore from "@/store/useAuthStore";

// 6. Actions/Services
import { applyCouponAction } from "@/actions/coupon-action";
import { createOrderAndInitiatePayment } from "@/actions/order-action";
import { checkPaymentStatus } from "@/actions/payment-action";

// 7. Utilities
import { formatCurrency } from "@/lib/utils";

export default function CheckoutsPage() {
  // 1. Router and refs
  const router = useRouter();
  const pollingIntervalRef = useRef(null);

  // 2. Cart and auth state
  const { items, itemCount, totalPrice, clearCart } = useCartStore();
  const { profile, isLoading } = useAuthStore();
  const hasHydrated = useCartStore((state) => state._hasHydrated);

  // 4. Local state
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("bakong_khqr");
  const [showKHQRModal, setShowKHQRModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const paymentMethods = [
    {
      id: "bakong_khqr",
      name: "KHQR Payment",
      description: "Scan to pay with Bakong app or any bank apps",
      image: "/KHQR-logo.png",
    },
  ];

  const count = itemCount();
  const total = totalPrice();
  const subtotal = total;
  const discount = appliedCoupon
    ? (subtotal * appliedCoupon.discount_percentage) / 100
    : 0;
  const finalTotal = subtotal - discount;

  const fullName = `${profile?.first_name} ${profile?.last_name}`;
  const telephone = profile?.telephone;
  const cityProvince = profile?.city_province;

  // ✅ CLEANUP: Stop polling when component unmounts
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log("Polling stopped");
    }
  };

  const pollPaymentStatus = async (orderId, transactionId, expiresAt) => {
    // Stop any existing polling first
    stopPolling();

    const maxAttempts = 18; // Poll for 3 minutes (every 10 seconds)
    let attempts = 0;

    const intervalId = setInterval(async () => {
      attempts++;

      const now = new Date().getTime();
      const expiryTime = new Date(expiresAt).getTime();
      const isExpired = now >= expiryTime;

      if (isExpired) {
        stopPolling();
        setShowKHQRModal(false);
        toast.error("QR code expired. Please checkout again.");
        return;
      }

      try {
        const result = await checkPaymentStatus(transactionId);

        if (result.status === "COMPLETED") {
          stopPolling();
          setShowKHQRModal(false);
          clearCart();
          toast.success(result.message);

          router.push(`/checkouts/success/${transactionId}`); // Redirect to success page
        } else if (result.status === "FAILED" || result.status === "EXPIRED") {
          clearInterval(intervalId);
          setShowKHQRModal(false);
          toast.error("Payment failed or expired. Please try again.");
        } else if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setShowKHQRModal(false);
          toast.warning("Payment expired. Please try to checkout again.");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 10000); // Check every 10 seconds

    // ✅ STORE the interval reference
    pollingIntervalRef.current = intervalId;
    console.log("Polling started, interval ID:", intervalId);
  };

  const handlePaymentMethodChange = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);

    const toastId = toast.loading("Applying coupon...");
    try {
      const result = await applyCouponAction(couponCode, profile.id);

      if (result.valid) {
        setAppliedCoupon(result.coupon);
        toast.success(
          `Coupon applied! ${result.coupon.discount_percentage}% off`,
          { id: toastId }
        );
      } else {
        toast.error(result.error, { id: toastId });
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(error.message, { id: toastId });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      const orderData = {
        // Customer info
        customerId: profile.id,

        // Items from cart
        cartItems: items,

        // Payment info
        paymentMethod: selectedPaymentMethod,

        // Pricing
        subtotal: subtotal,
        discountAmount: discount,
        totalAmount: finalTotal,
        // Promo code
        promoCodeId: appliedCoupon?.id || null,

        // Shipping address (from profile)
        shippingAddress: {
          fullName: fullName,
          cityProvince: cityProvince,
          telephone: telephone,
          country: "Cambodia",
        },
      };
      const result = await createOrderAndInitiatePayment(orderData);

      if (result.error) {
        toast.error(result.error);
      }

      if (result.success) {
        toast.success(result.message);

        setPaymentData(result.paymentData);
        setShowKHQRModal(true); // Open modal automatically

        console.log("Payment data", result.paymentData);

        // Start polling for payment status
        pollPaymentStatus(
          result.order.id,
          result.paymentData.transactionId,
          result.paymentData.expiresAt
        );
      }
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error("Error checking out");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseKHQRModal = () => {
    if (confirm("Are you sure you want to cancel the payment?")) {
      stopPolling(); // ✅ Stop polling when modal closes
      setShowKHQRModal(false);
      setPaymentData(null); // Clear payment data
    }
  };

  // Show loading state until Zustand has hydrated from localStorage
  // This prevents hydration mismatch between server-rendered empty state
  // and client-side persisted state
  if (!hasHydrated || isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Spinner />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <ShoppingCart className="w-18 h-18 text-muted-foreground mb-4" />
        <div className="space-y-1 text-center">
          <p className="text-2xl font-bold">Your cart is empty</p>
          <p className="text-muted-foreground">
            Check out our latest arrivals stay up-to-date with latest styles
          </p>
        </div>

        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 font-poppins">
      {showKHQRModal && paymentData && (
        <BakongKHQRModal
          isOpen={showKHQRModal}
          onClose={handleCloseKHQRModal}
          qrString={paymentData.qrString}
          amount={paymentData.decodedInfo.data.transactionAmount}
          merchantName={paymentData.decodedInfo.data.merchantName}
          expiresAt={paymentData.expiresAt}
        />
      )}

      <div className="space-y-10 pr-10 border-r border-border">
        {/* Delivery Address */}
        <div>
          <h2 className="text-2xl font-bold mb-4 font-poppins">
            Delivery Address
          </h2>

          <Card>
            <CardContent className="flex gap-5 items-start">
              <Checkbox checked={true} className="mt-2" />
              <div className="flex flex-col gap-0.5">
                <p className="text-lg font-semibold">{fullName}</p>

                <div>
                  <p className="text-sm text-muted-foreground">
                    {cityProvince}, Cambodia
                  </p>
                  <p className="text-sm text-muted-foreground">{telephone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Items */}
        <div>
          <h2 className="text-2xl font-bold mb-8 font-poppins">
            Your Items ({count})
          </h2>
          <div className="space-y-6 max-h-[28rem] overflow-y-auto scrollbar-hide">
            {items.map((item) => (
              <CheckoutItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-10 pl-10">
        <div>
          {/* Payment Method */}
          <h2 className="text-2xl font-bold mb-4 font-poppins">
            Payment Method
          </h2>

          <Card>
            <CardContent>
              {/* Use RadioGroup and set its 'value' and 'onValueChange' props */}
              <RadioGroup
                value={selectedPaymentMethod}
                onValueChange={handlePaymentMethodChange}
                // Optional: Add a name for form submission if needed
                // name="payment-method-group"
              >
                {paymentMethods.map((method) => (
                  <div className="flex items-center gap-4" key={method.id}>
                    <RadioGroupItem
                      className="cursor-pointer"
                      value={method.id}
                      id={method.id}
                    />
                    {/* Wrap the visual part in a Label for better click area and semantics */}
                    <Label
                      htmlFor={method.id}
                      className="flex items-center gap-2.5 cursor-pointer flex-grow" // Make the whole area clickable
                    >
                      <div className="relative w-14 h-14">
                        <Image
                          fill
                          quality={100}
                          src={method.image}
                          alt={method.name}
                          className="object-contain"
                        />
                      </div>

                      <div className="font-source-sans-3">
                        <p className="font-bold">{method.name}</p>
                        <span className="text-xs">{method.description}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Coupon Code */}
          <h2 className="text-2xl font-bold mb-2.5 font-poppins">
            Coupon Code
          </h2>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <Label>Enter Coupon Code</Label>

              <div className="flex items-center gap-6">
                <Input
                  placeholder="Enter coupon code"
                  className="w-2/3"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={isValidatingCoupon || appliedCoupon !== null}
                />
                {!appliedCoupon ? (
                  <Button
                    className="w-1/4"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                  >
                    {isValidatingCoupon ? "Applying..." : "Apply"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-1/4"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode("");
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
              {appliedCoupon && (
                <div className="flex items-center gap-2">
                  <TicketCheck size={20} className="text-success" />
                  <p className="text-sm text-success font-medium">
                    {appliedCoupon.code} applied (-
                    {appliedCoupon.discount_percentage}%)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Order Summary */}
          <h2 className="text-2xl font-bold mb-2.5 font-poppins">
            Order Summary
          </h2>

          {/* <BakongKHQRModal url={"https://www.google.com"} /> */}

          <Card>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  Subtotal ({count})
                </span>
                <span className="">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="">{formatCurrency(0)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between gap-4 text-success mb-4">
                  <span className="text-sm">
                    Discount ({appliedCoupon.code})
                  </span>
                  <span className="text-sm font-medium">
                    -{formatCurrency(discount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-xl font-semibold">
                  {formatCurrency(finalTotal)}
                </span>
              </div>

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
      </div>
    </div>
  );
}
