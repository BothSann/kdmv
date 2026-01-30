import { Button } from "@/components/ui/button";
import { MapPin, PlusIcon } from "lucide-react";
import Link from "next/link";
import AddressList from "@/components/address/AddressList";
import { getCustomerAddresses } from "@/lib/data/addresses";
import { getCurrentUser } from "@/lib/data/users";
import NotFound from "@/components/NotFound";
import EmptyState from "@/components/EmptyState";
import { redirect } from "next/navigation";

export const metadata = {
  title: "KDMV | Address",
  description: "View your addresses and manage your delivery information",
};

export default async function AddressPage() {
  const { user, error: userError } = await getCurrentUser();
  const customerId = user?.id;
  const { addresses, error: addressesError } = await getCustomerAddresses(
    customerId
  );

  if (!user) {
    redirect("/auth/login");
  }

  if (userError || addressesError) {
    return <NotFound href="/account/addresses" title="Addresses" />;
  }

  if (addresses.length === 0) {
    return (
      <>
        <EmptyState
          icon={MapPin}
          title="You have no addresses yet"
          description="Add an address to get started"
          action={{
            href: "/account/addresses/create",
            label: "Add Address",
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl xl:text-3xl font-bold">Address</h2>
        <Button asChild>
          <Link href="/account/addresses/create">
            <PlusIcon className="scale-80" />
            Add Address
          </Link>
        </Button>
      </div>

      <AddressList addresses={addresses} customerId={customerId} />
    </>
  );
}
