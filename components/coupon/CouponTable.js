import { getAllCoupons } from "@/lib/data/coupons";
import CouponTableClient from "./CouponTableClient";
import { getCurrentUser, getUserRole } from "@/lib/data/users";
import EmptyState from "../EmptyState";

export default async function CouponTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const { user } = await getCurrentUser();
  const { role } = await getUserRole(user?.id);

  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const { coupons, pagination } = await getAllCoupons({
    page,
    perPage: 10,
    role,
  });

  if (!coupons || coupons.length === 0) {
    return (
      <EmptyState
        icon={TicketPercent}
        title="No coupons yet"
        description="Create your first coupon to display in the store"
      />
    );
  }

  return <CouponTableClient coupons={coupons} pagination={pagination} />;
}
