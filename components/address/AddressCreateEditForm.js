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
import { useState } from "react";
import {
  createAddressAction,
  updateAddressAction,
} from "@/actions/address-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddressCreateEditForm({
  customerId,
  existingAddress = null,
}) {
  const isEditMode = Boolean(existingAddress);

  const [firstName, setFirstName] = useState(existingAddress?.first_name || "");

  const [lastName, setLastName] = useState(existingAddress?.last_name || "");

  const [phoneNumber, setPhoneNumber] = useState(
    existingAddress?.phone_number || ""
  );

  const [streetAddress, setStreetAddress] = useState(
    existingAddress?.street_address || ""
  );

  const [apartment, setApartment] = useState(existingAddress?.apartment || "");

  const [country, setCountry] = useState(
    existingAddress?.country || COUNTRIES[0].value
  );

  const [cityProvince, setCityProvince] = useState(
    existingAddress?.city_province || ""
  );

  const [isDefault, setIsDefault] = useState(
    existingAddress?.is_default || false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.target);

    const addressData = {
      // In EDIT mode: include ID
      ...(isEditMode && { id: existingAddress.id }),

      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      phone_number: formData.get("phone_number"),
      street_address: formData.get("street_address"),
      apartment: formData.get("apartment"),
      country: formData.get("country"),
      city_province: formData.get("city_province"),
      is_default: isDefault,
    };

    const actionToUse = isEditMode ? updateAddressAction : createAddressAction;

    const loadingMessage = isEditMode
      ? "Updating address..."
      : "Creating address...";

    const toastId = toast.loading(loadingMessage);

    try {
      const result = await actionToUse(
        isEditMode ? existingAddress.id : customerId,
        addressData
      );

      if (result.error) {
        toast.error(result.error, { id: toastId });
        return;
      }

      toast.success(result.message, { id: toastId });
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
      router.push(`/account/address`);
    }
  };
  return (
    <Card className="w-full lg:w-3/4">
      <CardHeader>
        <CardTitle>Please fill in the information below</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <Label htmlFor="first_name">
              First Name<span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="first_name"
              name="first_name"
              placeholder="Your first name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="last_name">
              Last Name<span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="last_name"
              name="last_name"
              placeholder="Your last name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="space-y-4 col-span-2">
            <Label htmlFor="phone_number">
              Phone<span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <div className="text-sm text-foreground/70 border border-border text-center bg-muted py-1.5 px-2 lg:px-4">
                &#x2b;855
              </div>
              <Input
                type="tel"
                id="phone_number"
                name="phone_number"
                placeholder="0123456789"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-4">
            <Label htmlFor="address">
              Street Address<span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="street_address"
              name="street_address"
              placeholder="Street, Building, Floor"
              className="truncate"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="apartment">Apartment (Optional)</Label>
            <Input
              type="text"
              id="apartment"
              name="apartment"
              placeholder="Apt 5B"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="country">
              Country<span className="text-destructive">*</span>
            </Label>
            <Select
              name="country"
              value={country}
              onValueChange={setCountry}
              required
            >
              <SelectTrigger className="w-full">
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
          </div>
          <div className="space-y-4">
            <Label htmlFor="city_province">
              City/Province<span className="text-destructive">*</span>
            </Label>
            <Select
              name="city_province"
              value={cityProvince}
              onValueChange={setCityProvince}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a city/province" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-48">
                  {CAMBODIA_PROVINCES.map((province) => (
                    <SelectItem key={province.value} value={province.value}>
                      {province.label}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Checkbox
              id="default_address"
              checked={isDefault}
              onCheckedChange={setIsDefault}
              disabled={isSubmitting}
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
