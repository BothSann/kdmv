import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/users";
import { getCustomerAddresses } from "@/lib/data/addresses";
import CheckoutClient from "../../../components/checkouts/CheckoutClient";

export const metadata = {
  title: "KDMV | Checkout",
  description: "Complete your purchase securely",
};

export default async function CheckoutsPage() {
  // 1. Server-side auth check
  const { user, error: userError } = await getCurrentUser();

  if (!user || userError) {
    redirect("/auth/login?redirect=/checkouts");
  }

  // 2. Pre-fetch addresses server-side for better performance
  const { addresses, error: addressError } = await getCustomerAddresses(
    user.id
  );

  // 3. Determine default address (fallback to first if no default set)
  const defaultAddress =
    addresses?.find((a) => a.is_default) || addresses?.[0] || null;

  // 4. Pass pre-fetched data to client component
  return (
    <CheckoutClient
      initialAddresses={addresses || []}
      initialSelectedAddress={defaultAddress}
      userId={user.id}
    />
  );
}
