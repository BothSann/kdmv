"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker24h } from "@/components/DateTimePicker24";
import { toast } from "sonner";
import {
  createNewCouponAction,
  updateCouponAction,
} from "@/actions/coupon-action";

export default function CouponCreateEditForm({ existingCoupon = null }) {
  const isEditMode = Boolean(existingCoupon);

  const [validFrom, setValidFrom] = useState(
    existingCoupon?.valid_from ? new Date(existingCoupon.valid_from) : undefined
  );
  const [validUntil, setValidUntil] = useState(
    existingCoupon?.valid_until
      ? new Date(existingCoupon.valid_until)
      : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isValidDate = () => {
    return validFrom && validUntil && validFrom <= validUntil;
  };

  const hasDates = () => {
    return validFrom && validUntil;
  };

  const handleWheel = (e) => {
    e.target.blur();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!hasDates()) {
      toast.error("Please select valid dates");
      setIsSubmitting(false);
      return;
    }

    if (!isValidDate()) {
      toast.error("Valid From must be before Valid Until");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.target);

    // Extract all form data including dates from hidden inputs
    const couponData = {
      ...(isEditMode && { id: existingCoupon.id }),
      code: formData.get("code"),
      discount_percentage: formData.get("discount_percentage"),
      description: formData.get("description"),
      max_uses_per_customer: formData.get("max_uses_per_customer"),
      max_total_uses: formData.get("max_total_uses"),
      valid_from: formData.get("valid_from"), // ISO string from DateTimePicker
      valid_until: formData.get("valid_until"), // ISO string from DateTimePicker
    };

    const actionToUse = isEditMode ? updateCouponAction : createNewCouponAction;

    const loadingMessage = isEditMode
      ? "Updating coupon..."
      : "Creating coupon...";

    const toastId = toast.loading(loadingMessage);

    try {
      const { success, error, message } = await actionToUse(couponData);

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      if (success) {
        toast.success(message, { id: toastId });

        // After editing: redirect to the specific coupon details page
        if (isEditMode) router.push(`/admin/coupons/${existingCoupon.id}`);
        // Otherwise (After creating): redirect to coupons list
        else router.push("/admin/coupons");
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild disabled={isSubmitting}>
              <Link href="/admin/coupons">
                <ChevronLeft />
              </Link>
            </Button>

            <h1 className="text-4xl font-bold">
              {isEditMode ? "Edit Coupon" : "Create Coupon"}
            </h1>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild disabled={isSubmitting}>
              <Link href="/admin/coupons">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Coupon"
                : "Create Coupon"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 lg:items-start">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Coupon Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label>Coupon Code</Label>
                    <Input
                      type="text"
                      name="code"
                      required
                      defaultValue={existingCoupon?.code || ""}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Discount Percentage (%)</Label>
                    <Input
                      type="number"
                      name="discount_percentage"
                      required
                      min="0"
                      max="100"
                      onWheel={handleWheel}
                      defaultValue={existingCoupon?.discount_percentage || ""}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Coupon Description (Optional)</Label>
                    <Textarea
                      name="description"
                      maxLength={255}
                      defaultValue={existingCoupon?.description || ""}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coupon Usage Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label>Max Uses Per Customer</Label>
                    <Input
                      type="number"
                      name="max_uses_per_customer"
                      min="1"
                      required
                      onWheel={handleWheel}
                      defaultValue={existingCoupon?.max_uses_per_customer || ""}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Max Total Uses</Label>
                    <Input
                      type="number"
                      name="max_total_uses"
                      min="1"
                      onWheel={handleWheel}
                      defaultValue={existingCoupon?.max_total_uses || ""}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Coupon Validity Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label>Valid From</Label>
                  <DateTimePicker24h
                    name="valid_from"
                    value={validFrom}
                    onChange={setValidFrom}
                    disabled={isSubmitting}
                  />
                  {hasDates() && !isValidDate() && (
                    <p className="text-destructive text-sm mt-3">
                      Valid From must be before Valid Until
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Valid Until</Label>
                  <DateTimePicker24h
                    name="valid_until"
                    value={validUntil}
                    onChange={setValidUntil}
                    disabled={isSubmitting}
                  />
                  {hasDates() && !isValidDate() && (
                    <p className="text-destructive text-sm mt-3">
                      Valid Until must be after Valid From
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
