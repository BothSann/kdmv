"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddressDisplayCard from "@/components/address/AddressDisplayCard";
import AddressSelectorDialog from "@/components/address/AddressSelectorDialog";
import Spinner from "@/components/Spinner";

/**
 * Client Component - Manages address selection with dialog
 */
export default function DeliveryAddressSection({
  addresses,
  selectedAddress,
  onSelectAddress,
  isLoading = false,
}) {
  const [showDialog, setShowDialog] = useState(false);

  const handleSelectAddress = (address) => {
    onSelectAddress(address);
    setShowDialog(false);
    toast.success("Delivery address updated");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 font-poppins">
        Delivery Address
      </h2>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Spinner />
          </CardContent>
        </Card>
      ) : (
        <>
          <AddressDisplayCard
            address={selectedAddress}
            onChangeClick={() => setShowDialog(true)}
          />

          {addresses.length === 0 && (
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <Link href="/account/address/create">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Your First Address
                </Link>
              </Button>
            </div>
          )}
        </>
      )}

      {/* Address Selection Dialog */}
      <AddressSelectorDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        addresses={addresses}
        selectedAddressId={selectedAddress?.id}
        onSelect={handleSelectAddress}
      />
    </div>
  );
}
