"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function AddressSelectorDialog({
  isOpen,
  onClose,
  addresses, // Pass from parent
  selectedAddressId,
  onSelect,
}) {
  const [tempSelectedId, setTempSelectedId] = useState(selectedAddressId);

  const handleConfirm = () => {
    const selected = addresses.find((a) => a.id === tempSelectedId);
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Delivery Address</DialogTitle>
          <DialogDescription>
            Choose where you want your order delivered
          </DialogDescription>
        </DialogHeader>

        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No saved addresses</p>
            <Button asChild>
              <Link href="/account/address/create">
                <Plus />
                Add New Address
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <RadioGroup
              value={tempSelectedId}
              onValueChange={setTempSelectedId}
            >
              <div className="space-y-4">
                {addresses.map((address) => {
                  const fullName = `${address.first_name} ${address.last_name}`;
                  const fullAddress = [
                    address.street_address,
                    address.apartment,
                    address.city_province,
                    address.country,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <div
                      key={address.id}
                      className={`border p-4 cursor-pointer transition ${
                        tempSelectedId === address.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => setTempSelectedId(address.id)}
                    >
                      <div className="flex items-start gap-4">
                        <RadioGroupItem
                          value={address.id}
                          id={address.id}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Label
                              htmlFor={address.id}
                              className="font-semibold cursor-pointer"
                            >
                              {fullName}
                            </Label>
                            {address.is_default && (
                              <Badge variant="default">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {fullAddress}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.phone_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>

            <div className="flex gap-4 mt-6">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/account/address/create">
                  <Plus />
                  Add New Address
                </Link>
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!tempSelectedId}
                className="flex-1"
              >
                Confirm Address
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
