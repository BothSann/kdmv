"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { Controller } from "react-hook-form";
import FormError from "@/components/FormError";
import { cn } from "@/lib/utils";

export default function ProductTypeAndGender({
  productTypes = [],
  genders = [],
  control,
  errors,
  isSubmitting,
  productTypeId,
  genderId,
}) {
  const selectedProductType = productTypes.find((pt) => pt.id === productTypeId);
  const selectedGender = genders.find((g) => g.id === genderId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Type & Gender</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Type Select */}
        <div className="space-y-2">
          <Label htmlFor="product_type_id">
            Product Type<span className="text-destructive">*</span>
          </Label>
          <Controller
            name="product_type_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    errors.product_type_id && "border-destructive"
                  )}
                  id="product_type_id"
                >
                  <SelectValue placeholder="Select a product type" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((productType) => (
                    <SelectItem key={productType.id} value={productType.id}>
                      {productType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.product_type_id && (
            <FormError message={errors.product_type_id.message} />
          )}
        </div>

        {/* Gender Select */}
        <div className="space-y-2">
          <Label htmlFor="gender_id">
            Gender<span className="text-destructive">*</span>
          </Label>
          <Controller
            name="gender_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    errors.gender_id && "border-destructive"
                  )}
                  id="gender_id"
                >
                  <SelectValue placeholder="Select a gender" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((gender) => (
                    <SelectItem key={gender.id} value={gender.id}>
                      {gender.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender_id && (
            <FormError message={errors.gender_id.message} />
          )}
        </div>

        {/* Preview */}
        {selectedProductType && selectedGender && (
          <div className="bg-muted border border-border p-4 space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Current Selection
            </Label>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{selectedGender.name}&apos;s</span>
              <span className="text-muted-foreground">&rarr;</span>
              <span className="font-medium">{selectedProductType.name}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
