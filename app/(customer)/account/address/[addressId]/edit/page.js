import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import AddressCreateEditForm from "@/components/address/AddressCreateEditForm";
import NotFound from "@/components/NotFound";
import { getCurrentUser } from "@/lib/api/server/users";
import { redirect } from "next/navigation";
import { getAddressById } from "@/lib/api/server/addresses";

export default async function AddressPage({ params }) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const customerId = user?.id;

  const resolvedParams = await params;
  const { addressId } = resolvedParams;

  const { address, error } = await getAddressById(customerId, addressId);

  if (error || !address)
    return <NotFound href="/account/address" title="Address not found" />;

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline">
          <Link href="/account/address">
            <ChevronLeft />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold">Edit Address</h2>
      </div>

      <AddressCreateEditForm
        customerId={customerId}
        existingAddress={address}
      />
    </>
  );
}
