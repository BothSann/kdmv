"use client";

import { setDefaultAddressAction } from "@/actions/address-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PencilIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import DeleteAddressDialog from "./DeleteAddressDialog";

export default function AddressCard({ address, customerId }) {
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fullName = `${address.first_name} ${address.last_name}`;
  const addressId = address.id;
  const phoneNumber = address.phone_number;
  const country = address.country;
  const cityProvince = address.city_province;
  const streetAddress = address.street_address;
  const isDefault = address.is_default;

  const handleSetDefaultAddress = async () => {
    if (isDefault) return;

    setIsPending(true);
    const toastId = toast.loading("Setting default address...");
    const result = await setDefaultAddressAction(addressId, customerId);

    if (result.error) {
      toast.error(result.error, { id: toastId });
    } else {
      toast.success(result.message, { id: toastId });
    }

    setIsPending(false);
  };

  return (
    <Card className="mt-6">
      <CardContent className="flex gap-5 items-start">
        <Checkbox
          checked={isDefault}
          onCheckedChange={handleSetDefaultAddress}
          disabled={isPending || isDefault}
          className="mt-2"
        />
        <div className="flex flex-col">
          <p className="font-semibold mb-2">{fullName}</p>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {cityProvince}, {country}
            </p>
            <p className="text-sm text-muted-foreground">{streetAddress}</p>
            <p className="text-sm text-muted-foreground">{phoneNumber}</p>
          </div>
        </div>

        <div className="ml-auto flex flex-col items-end gap-4">
          {isDefault && <Badge variant="default">Default</Badge>}
          <div className="flex items-center">
            <Button variant="ghost" size="sm">
              <Link href={`/account/address/${address.id}/edit`}>
                <PencilIcon />
              </Link>
            </Button>
            {!isDefault && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(true)}
                >
                  <Trash2 />
                </Button>
                <DeleteAddressDialog
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  addressId={addressId}
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
