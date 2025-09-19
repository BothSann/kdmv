import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CouponNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)] text-center space-y-4">
      <h2 className="text-3xl font-bold">Coupon Not Found</h2>
      <p className="text-muted-foreground">
        The coupon you&apos;re looking for doesn&apos;t exist or has been
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
