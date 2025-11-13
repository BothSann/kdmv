import CouponTable from "@/components/coupon/CouponTable";
import PaginationStateManager from "@/components/PaginationStateManager";
import TableSkeleton from "@/components/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function AdminCouponsPage({ searchParams }) {
  return (
    <>
      <PaginationStateManager />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Coupons</h1>
          <p className="text-muted-foreground mt-1">
            Manage coupons in the store
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/coupons/create">
            <Plus />
            Create Coupon
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <CouponTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}
