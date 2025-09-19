import CouponTable from "@/components/CouponTable";
import TableSkeleton from "@/components/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function AdminCouponsPage() {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Coupons</h1>
        <Button asChild>
          <Link href="/admin/coupons/create">
            <Plus />
            Create Coupon
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <CouponTable />
      </Suspense>
    </>
  );
}
