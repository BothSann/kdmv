import { getAllCoupons } from "@/lib/api/server/coupons";
import CouponTableClient from "./CouponTableClient";

export default async function CouponTable({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const { coupons, pagination } = await getAllCoupons({ page, perPage: 10 });

  if (!coupons.length) return null;

  return <CouponTableClient coupons={coupons} pagination={pagination} />;
}
