import { getAllCoupons } from "@/lib/api/coupons";
import CouponTableClient from "./CouponTableClient";
import { getCurrentUser, getUserRole } from "@/lib/api/users";

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

  if (!coupons.length) return null;

  return <CouponTableClient coupons={coupons} pagination={pagination} />;
}
