import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  PenLine,
  Calendar,
  Users,
  Percent,
  Hash,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TicketPercent,
  Code,
  CalendarX2,
  CalendarClock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import Link from "next/link";
import { getCouponById } from "@/lib/apiCoupons";
import {
  cn,
  formatISODateToDayDateMonthYearWithAtTime,
  formatISODateToDayMonthNameYear,
} from "@/lib/utils";
import DeleteCouponButton from "@/components/DeleteCouponButton";
import CouponNotFound from "@/components/CouponNotFound";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { coupon, error } = await getCouponById(resolvedParams.couponId);

  if (error || !coupon) {
    return {
      title: "Coupon Not Found",
    };
  }

  return {
    title: `Coupon ${coupon.code}`,
  };
}

export default async function AdminCouponDetailPage({ params }) {
  const resolvedParams = await params;
  const { coupon, error } = await getCouponById(resolvedParams.couponId);

  if (error || !coupon) {
    return <CouponNotFound />;
  }

  return (
    <>
      <Header coupon={coupon} />
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_2fr] gap-6 mt-10 lg:items-start">
        <CouponVisualCard coupon={coupon} />
        <CouponDetailsSection coupon={coupon} />
      </div>
    </>
  );
}

function Header({ coupon }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/coupons">
            <ChevronLeft />
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold">{coupon.code}</h2>
          <Badge
            className={cn(
              coupon.isReachedUsageLimit || coupon.isExpired
                ? "bg-destructive dark:text-foreground"
                : coupon.isNotYetValid
                ? "bg-warning dark:text-foreground"
                : "bg-success dark:text-foreground"
            )}
          >
            {coupon.isReachedUsageLimit || coupon.isExpired
              ? "Inactive"
              : coupon.isNotYetValid
              ? "Not Yet Active"
              : "Active"}
          </Badge>
        </div>
      </div>

      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/admin/coupons/${coupon.id}/edit`}>
            <PenLine />
            Edit
          </Link>
        </Button>

        <DeleteCouponButton coupon={coupon} redirectTo="/admin/coupons" />
      </div>
    </div>
  );
}

function CouponVisualCard({ coupon }) {
  // Use calculated values from API

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="absolute" />
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <TicketPercent size={32} />

              <div>
                <CardTitle className="text-2xl">
                  {coupon.discount_percentage}% OFF
                </CardTitle>
                <CardDescription>Discount Coupon</CardDescription>
              </div>
            </div>

            {coupon.isExpired ? (
              <CalendarX2 size={32} />
            ) : coupon.isNotYetValid ? (
              <CalendarClock size={32} />
            ) : (
              <CheckCircle size={32} />
            )}
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          <div className="text-center p-6 border-2 space-y-2 border-dashed border-border bg-muted">
            <h2 className="text-3xl font-bold">{coupon.code}</h2>
            <p className="text-sm text-muted-foreground">Coupon Code</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">{coupon.total_uses}</div>
              <div className="text-muted-foreground">Total Uses</div>
            </div>

            <div className="text-center">
              <div className="font-semibold text-lg">
                {coupon.remainingUses !== null ? coupon.remainingUses : "∞"}
              </div>
              <div className="text-muted-foreground">Remaining</div>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-muted-foreground h-3 rounded-full transition-all duration-500"
              style={{
                width: `${coupon.usagePercentage || 0}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Validity Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar />
            Validity Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Valid From</Label>
            <p className="text-base font-medium ">
              {formatISODateToDayMonthNameYear(coupon.valid_from)}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Valid Until</Label>
            <p className="text-base font-medium ">
              {formatISODateToDayMonthNameYear(coupon.valid_until)}
            </p>
          </div>

          {coupon.daysLeft && coupon.daysLeft > 0 ? (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Days Left</Label>
              <p className="text-base font-medium">{coupon.daysLeft}</p>
            </div>
          ) : (
            ""
          )}

          <div className="pt-4 border-t border-border">
            <Label className="text-muted-foreground">Status</Label>
            <div className="mt-2">
              {coupon.isExpired ? (
                <Badge variant="destructive" className="dark:text-foreground">
                  Expired
                </Badge>
              ) : coupon.isReachedUsageLimit ? (
                <Badge variant="destructive" className="dark:text-foreground">
                  Reached Usage Limit
                </Badge>
              ) : coupon.isNotYetValid ? (
                <Badge className="bg-warning dark:text-foreground">
                  Not Yet Active
                </Badge>
              ) : (
                <Badge className="bg-success dark:text-foreground">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CouponDetailsSection({ coupon }) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText />
            Coupon Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Coupon Code</Label>
              <p className="text-lg font-semibold">{coupon?.code}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Discount</Label>
              <p className="text-lg font-semibold">
                {coupon?.discount_percentage}%
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <p className="text-base">{coupon?.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users />
            Usage Limits
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                Max Uses Per Customer
              </Label>
              <p className="text-2xl font-bold">
                {coupon?.max_uses_per_customer}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Max Total Uses</Label>
              <p className="text-2xl font-bold">
                {coupon?.max_total_uses?.toLocaleString() || "Unlimited"}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <Label className="text-muted-foreground">Current Usage</Label>

              <Badge variant="outline">
                {coupon?.total_uses} / {coupon?.max_total_uses}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Code />
            Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Coupon ID</Label>
            <span className="text-sm font-mono bg-muted px-3 py-1 rounded">
              {coupon?.id}
            </span>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Created At</Label>
            <p className="text-sm">
              {formatISODateToDayDateMonthYearWithAtTime(coupon?.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
