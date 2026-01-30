import AddressCreateEditForm from "@/components/address/AddressCreateEditForm";
import NotFound from "@/components/NotFound";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/data/users";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function AddressCreatePage() {
  const { user, error: userError } = await getCurrentUser();
  const customerId = user?.id;

  if (!user || userError) {
    return <NotFound href="/account/addresses" title="Address" />;
  }
  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline">
          <Link href="/account/addresses">
            <ChevronLeft />
          </Link>
        </Button>
        <h2 className="text-2xl xl:text-3xl font-bold">Add New Address</h2>
      </div>

      <AddressCreateEditForm customerId={customerId} />
    </>
  );
}
