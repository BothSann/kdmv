"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TicketCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyCouponAction } from "@/server/actions/coupon-action";

/**
 * Client Component - Coupon code validation and application
 */
export default function CouponSection({
  userId,
  appliedCoupon,
  onCouponApplied,
}) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyCoupon = async () => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidating(true);
    const toastId = toast.loading("Applying coupon...");

    try {
      const result = await applyCouponAction(code, userId);

      if (result.valid) {
        onCouponApplied(result.coupon);
        toast.success(
          `Coupon applied! ${result.coupon.discount_percentage}% off`,
          { id: toastId }
        );
      } else {
        toast.error(result.error, { id: toastId });
        onCouponApplied(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(error.message, { id: toastId });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponApplied(null);
    setCode("");
    toast.success("Coupon removed");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2.5 font-poppins">Coupon Code</h2>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Label>Enter Coupon Code</Label>

          <div className="flex items-center gap-4">
            <Input
              placeholder="Enter coupon code"
              className="w-2/3"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isValidating || appliedCoupon !== null}
            />
            {!appliedCoupon ? (
              <Button
                className="w-1/4"
                onClick={handleApplyCoupon}
                disabled={isValidating || !code.trim()}
              >
                {isValidating ? "Applying..." : "Apply"}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-1/4"
                onClick={handleRemoveCoupon}
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
  );
}
