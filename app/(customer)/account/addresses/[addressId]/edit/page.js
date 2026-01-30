import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import AddressCreateEditForm from "@/components/address/AddressCreateEditForm";
import NotFound from "@/components/NotFound";
import { getCurrentUser } from "@/lib/data/users";
import { redirect } from "next/navigation";
import { getAddressById } from "@/lib/data/addresses";

export const metadata = {
  title: "KDMV | Edit Address",
  description: "Edit your address and manage your delivery information",
};

export default async function AddressPage({ params }) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const customerId = user?.id;

  const resolvedParams = await params;
  const { addressId } = resolvedParams;

  const { address, error } = await getAddressById(customerId, addressId);

  if (error || !address)
    return <NotFound href="/account/addresses" title="Address" />;

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline">
          <Link href="/account/addresses">
            <ChevronLeft />
          </Link>
        </Button>
        <h2 className="text-2xl xl:text-3xl font-bold">Edit Address</h2>
      </div>

      <AddressCreateEditForm
        customerId={customerId}
        existingAddress={address}
      />
    </>
  );
}
