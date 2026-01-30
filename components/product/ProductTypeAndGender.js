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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Controller } from "react-hook-form";
import FormError from "@/components/FormError";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];

export default function ProductTypeAndGender({
  productTypes = [],
  control,
  errors,
  isSubmitting,
  productTypeId,
  gender,
}) {
  const selectedProductType = productTypes.find((pt) => pt.id === productTypeId);

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

        {/* Gender Radio Group */}
        <div className="space-y-3">
          <Label>
            Gender<span className="text-destructive">*</span>
          </Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
                className="flex flex-wrap gap-4"
              >
                {GENDER_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.value}
                      id={`gender-${option.value}`}
                    />
                    <Label
                      htmlFor={`gender-${option.value}`}
                      className="font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          {errors.gender && <FormError message={errors.gender.message} />}
        </div>

        {/* Preview */}
        {selectedProductType && gender && (
          <div className="bg-muted border border-border p-4 space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Current Selection
            </Label>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium capitalize">{gender}&apos;s</span>
              <span className="text-muted-foreground">&rarr;</span>
              <span className="font-medium">{selectedProductType.name}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
