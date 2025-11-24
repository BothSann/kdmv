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
} from "@/server/actions/coupon-action";

// React Hook Form and Zod validation
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema } from "@/lib/validations/coupon";
import FormError from "@/components/FormError";
import { cn } from "@/lib/utils";

export default function CouponCreateEditForm({ existingCoupon = null }) {
  const isEditMode = Boolean(existingCoupon);
  const router = useRouter();

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(couponSchema),
    mode: "onBlur", // Validate when user leaves field
    defaultValues: {
      code: existingCoupon?.code || "",
      discount_percentage: existingCoupon?.discount_percentage?.toString() || "",
      description: existingCoupon?.description || "",
      max_uses_per_customer:
        existingCoupon?.max_uses_per_customer?.toString() || "",
      max_total_uses: existingCoupon?.max_total_uses?.toString() || "",
      valid_from: existingCoupon?.valid_from
        ? new Date(existingCoupon.valid_from)
        : undefined,
      valid_until: existingCoupon?.valid_until
        ? new Date(existingCoupon.valid_until)
        : undefined,
    },
  });

  const handleWheel = (e) => {
    e.target.blur();
  };

  // Form submission handler (validated by Zod)
  const onSubmit = async (data) => {
    // Prepare coupon data with validated form data
    const couponData = {
      ...(isEditMode && { id: existingCoupon.id }),
      ...data, // Spread all validated data (already transformed by Zod)
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
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
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
                    <Label htmlFor="code">
                      Coupon Code<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...register("code")}
                      id="code"
                      type="text"
                      disabled={isSubmitting}
                      className={cn(errors.code && "border-destructive")}
                      placeholder="e.g., SAVE20"
                    />
                    {errors.code && <FormError message={errors.code.message} />}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="discount_percentage">
                      Discount Percentage (%)<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...register("discount_percentage")}
                      id="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      onWheel={handleWheel}
                      disabled={isSubmitting}
                      className={cn(errors.discount_percentage && "border-destructive")}
                      placeholder="0.00"
                    />
                    {errors.discount_percentage && (
                      <FormError message={errors.discount_percentage.message} />
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description">Coupon Description (Optional)</Label>
                    <Textarea
                      {...register("description")}
                      id="description"
                      disabled={isSubmitting}
                      className={cn(errors.description && "border-destructive")}
                      placeholder="Brief description of the coupon..."
                    />
                    {errors.description && (
                      <FormError message={errors.description.message} />
                    )}
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
                    <Label htmlFor="max_uses_per_customer">
                      Max Uses Per Customer<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...register("max_uses_per_customer")}
                      id="max_uses_per_customer"
                      type="number"
                      min="1"
                      onWheel={handleWheel}
                      disabled={isSubmitting}
                      className={cn(
                        errors.max_uses_per_customer && "border-destructive"
                      )}
                      placeholder="1"
                    />
                    {errors.max_uses_per_customer && (
                      <FormError message={errors.max_uses_per_customer.message} />
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="max_total_uses">
                      Max Total Uses (Leave empty for unlimited)
                    </Label>
                    <Input
                      {...register("max_total_uses")}
                      id="max_total_uses"
                      type="number"
                      min="1"
                      onWheel={handleWheel}
                      disabled={isSubmitting}
                      className={cn(errors.max_total_uses && "border-destructive")}
                      placeholder="Empty = unlimited"
                    />
                    {errors.max_total_uses && (
                      <FormError message={errors.max_total_uses.message} />
                    )}
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
                  <Label htmlFor="valid_from">
                    Valid From<span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="valid_from"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker24h
                        name="valid_from"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.valid_from && (
                    <FormError message={errors.valid_from.message} />
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="valid_until">
                    Valid Until<span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="valid_until"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker24h
                        name="valid_until"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.valid_until && (
                    <FormError message={errors.valid_until.message} />
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
