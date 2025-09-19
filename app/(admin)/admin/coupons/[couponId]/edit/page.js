import CouponCreateEditForm from "@/components/CouponCreateEditForm";
import { getCouponById } from "@/lib/apiCoupons";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { coupon, error } = await getCouponById(resolvedParams.couponId);

  if (error || !coupon) {
    return {
      title: "Edit Coupon - Not Found",
    };
  }

  return {
    title: `Edit ${coupon.code}`,
  };
}

export default async function AdminEditCouponPage({ params }) {
  const resolvedParams = await params;
  const { coupon, error } = await getCouponById(resolvedParams.couponId);

  if (error || !coupon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)] text-center space-y-4">
        <h2 className="text-3xl font-bold">Coupon Not Found</h2>
        <p className="text-muted-foreground">
          The coupon you&apos;re trying to edit doesn&apos;t exist or has been
          deleted.
        </p>
        <Button asChild>
          <Link href="/admin/coupons">
            <ChevronLeft />
            Back to Coupons
          </Link>
        </Button>
      </div>
    );
  }

  return <CouponCreateEditForm existingCoupon={coupon} />;
}
