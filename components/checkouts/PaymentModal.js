"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import BakongKHQRModal from "@/components/BakongKHQRModal";
import useCartStore from "@/store/useCartStore";
import { checkPaymentStatus } from "@/server/actions/payment-action";

/**
 * Client Component - Payment QR modal with status polling
 */
export default function PaymentModal({ paymentData, orderId, onClose }) {
  const router = useRouter();
  const { clearCart } = useCartStore();
  const pollingIntervalRef = useRef(null);

  // Start polling when component mounts
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log("Polling stopped");
    }
  }, []);

  const startPolling = () => {
    const maxAttempts = 18; // Poll for 3 minutes (every 10 seconds)
    let attempts = 0;

    const intervalId = setInterval(async () => {
      attempts++;

      // Check if QR code has expired
      const now = new Date().getTime();
      const expiryTime = new Date(paymentData.expiresAt).getTime();
      const isExpired = now >= expiryTime;

      if (isExpired) {
        stopPolling();
        onClose();
        toast.error("QR code expired. Please checkout again.");
        return;
      }

      try {
        const result = await checkPaymentStatus(paymentData.transactionId);
        console.log("Payment status check:", result);

        if (result.status === "COMPLETED") {
          stopPolling();
          onClose();
          clearCart();
          toast.success(result.message || "Payment successful!");
          router.push(`/checkouts/success/${paymentData.transactionId}`);
        } else if (result.status === "FAILED" || result.status === "EXPIRED") {
          stopPolling();
          onClose();
          toast.error("Payment failed or expired. Please try again.");
        } else if (attempts >= maxAttempts) {
          stopPolling();
          onClose();
          toast.warning(
            "Payment check timeout. Please verify your order status."
          );
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 10000); // Check every 10 seconds

    pollingIntervalRef.current = intervalId;
    console.log("Polling started, interval ID:", intervalId);
  };

  const handleClose = useCallback(() => {
    if (confirm("Are you sure you want to cancel the payment?")) {
      stopPolling();
      onClose();
    }
  }, [stopPolling, onClose]);

  return (
    <BakongKHQRModal
      isOpen={true}
      onClose={handleClose}
      qrString={paymentData.qrString}
      amount={paymentData.decodedInfo.data.transactionAmount}
      merchantName={paymentData.decodedInfo.data.merchantName}
      expiresAt={paymentData.expiresAt}
    />
  );
}
