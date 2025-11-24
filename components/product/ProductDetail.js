"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormError from "@/components/FormError";
import { cn } from "@/lib/utils";

export default function ProductDetail({ register, errors, isSubmitting }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="name">
            Name<span className="text-destructive">*</span>
          </Label>
          <Input
            {...register("name")}
            id="name"
            type="text"
            placeholder="Enter product name"
            disabled={isSubmitting}
            className={cn("w-full", errors.name && "border-destructive")}
          />
          {errors.name && <FormError message={errors.name.message} />}
        </div>

        <div className="space-y-3">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            {...register("description")}
            id="description"
            rows={4}
            placeholder="Enter product description"
            disabled={isSubmitting}
            className={cn("w-full", errors.description && "border-destructive")}
          />
          {errors.description && (
            <FormError message={errors.description.message} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
