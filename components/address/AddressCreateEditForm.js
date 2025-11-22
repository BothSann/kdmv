"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CAMBODIA_PROVINCES, COUNTRIES } from "@/lib/constants";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema } from "@/lib/validations/address";
import { cn } from "@/lib/utils";
import FormError from "@/components/FormError";
import {
  createAddressAction,
  updateAddressAction,
} from "@/server/actions/address-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddressCreateEditForm({
  customerId,
  existingAddress = null,
}) {
  const isEditMode = Boolean(existingAddress);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(addressSchema),
    mode: "onBlur",
    defaultValues: {
      first_name: existingAddress?.first_name || "",
      last_name: existingAddress?.last_name || "",
      phone_number: existingAddress?.phone_number || "",
      street_address: existingAddress?.street_address || "",
      apartment: existingAddress?.apartment || "",
      country: existingAddress?.country || COUNTRIES[0].value,
      city_province: existingAddress?.city_province || "",
      is_default: existingAddress?.is_default || false,
    },
  });

  const onSubmit = async (data) => {
    // data is already validated by Zod!
    const actionToUse = isEditMode ? updateAddressAction : createAddressAction;

    const loadingMessage = isEditMode
      ? "Updating address..."
      : "Creating address...";

    const toastId = toast.loading(loadingMessage);

    try {
      const result = await (isEditMode
        ? actionToUse(existingAddress.id, customerId, data)
        : actionToUse(customerId, data));

      if (result.error) {
        toast.error(result.error, { id: toastId });
        return;
      }

      toast.success(result.message, { id: toastId });
      router.push("/account/addresses");
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };
  return (
    <Card className="w-full lg:w-3/4">
      <CardContent>
        <form
          className="grid grid-cols-2 gap-4 space-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2.5">
            <Label htmlFor="first_name">
              First Name<span className="text-destructive">*</span>
            </Label>
            <Input
              {...register("first_name")}
              id="first_name"
              type="text"
              placeholder="Your first name"
              disabled={isSubmitting}
              className={cn(
                "w-full",
                errors.first_name && "border-destructive"
              )}
            />
            {errors.first_name && (
              <FormError message={errors.first_name.message} />
            )}
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="last_name">
              Last Name<span className="text-destructive">*</span>
            </Label>
            <Input
              {...register("last_name")}
              id="last_name"
              type="text"
              placeholder="Your last name"
              disabled={isSubmitting}
              className={cn("w-full", errors.last_name && "border-destructive")}
            />
            {errors.last_name && (
              <FormError message={errors.last_name.message} />
            )}
          </div>
          <div className="space-y-2.5 col-span-2">
            <Label htmlFor="phone_number">
              Phone<span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <div className="text-sm text-foreground/70 border border-border text-center bg-muted py-1.5 px-2 lg:px-4">
                &#x2b;855
              </div>
              <div className="flex-1 space-y-2.5">
                <Input
                  {...register("phone_number")}
                  id="phone_number"
                  type="tel"
                  placeholder="0123456789"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full",
                    errors.phone_number && "border-destructive"
                  )}
                />
                {errors.phone_number && (
                  <FormError message={errors.phone_number.message} />
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="street_address">
              Street Address<span className="text-destructive">*</span>
            </Label>
            <Input
              {...register("street_address")}
              id="street_address"
              type="text"
              placeholder="Street, Building, Floor"
              disabled={isSubmitting}
              className={cn(
                "w-full truncate",
                errors.street_address && "border-destructive"
              )}
            />
            {errors.street_address && (
              <FormError message={errors.street_address.message} />
            )}
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="apartment">Apartment (Optional)</Label>
            <Input
              {...register("apartment")}
              id="apartment"
              type="text"
              placeholder="Apt 5B"
              disabled={isSubmitting}
              className={cn("w-full", errors.apartment && "border-destructive")}
            />
            {errors.apartment && (
              <FormError message={errors.apartment.message} />
            )}
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="country">
              Country<span className="text-destructive">*</span>
            </Label>
            <Controller
              name="country"
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
                      errors.country && "border-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.country && <FormError message={errors.country.message} />}
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="city_province">
              City/Province<span className="text-destructive">*</span>
            </Label>
            <Controller
              name="city_province"
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
                      errors.city_province && "border-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select a city/province" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <ScrollArea className="h-48">
                      {CAMBODIA_PROVINCES.map((province) => (
                        <SelectItem key={province.value} value={province.value}>
                          {province.label}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.city_province && (
              <FormError message={errors.city_province.message} />
            )}
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Controller
              name="is_default"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="default_address"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting || existingAddress?.is_default}
                />
              )}
            />
            <Label htmlFor="default_address">Set as default address</Label>
          </div>
          <div className="flex justify-end gap-3 col-span-2">
            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
