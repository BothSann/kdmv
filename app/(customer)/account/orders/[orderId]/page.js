import NotFound from "@/components/NotFound";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderDetails } from "@/lib/api/server/orders";
import { getCurrentUser } from "@/lib/api/server/users";
import { formatCurrency } from "@/lib/utils";
import {
  BadgeCheck,
  ChevronLeft,
  CircleDollarSign,
  Clock,
  MapPinHouse,
  PackageOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { orderId } = resolvedParams;

  const { user } = await getCurrentUser();
  const userId = user?.id;

  const { order, error } = await getOrderDetails(orderId, userId);

  if (error || !order) {
    return {
      title: "Order Not Found",
    };
  }

  return {
    title: `Order | ${order.order_number}`,
  };
}

export default async function OrderDetailPage({ params }) {
  const resolvedParams = await params;
  const { orderId } = resolvedParams;

  const { user } = await getCurrentUser();
  const userId = user?.id;

  const { order, error } = await getOrderDetails(orderId, userId);

  if (error || !order) {
    return <NotFound href="/account/orders" title="Order" />;
  }

  const paymentStatus = order?.payment_status;
  const paymentMethod = order?.payment_method;
  const orderItems = order?.order_items || [];
  const { cityProvince, country, fullName, telephone } =
    order?.shipping_address;

  const subtotal = order?.subtotal;
  const totalAmount = order?.total_amount;
  const saveAmount = order?.discount_amount;

  const hasPromoCode = !!order?.promo_codes;
  const promoCode = order?.promo_codes?.code;
  const promoDiscount = order?.promo_codes?.discount_percentage;

  const getPaymentStatusBadgeVariant = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "PAID":
        return "success";
      case "FAILED":
        return "destructive";
      default:
        return "default";
    }
  };
  const paymentStatusBadgeVariant = getPaymentStatusBadgeVariant(paymentStatus);

  return (
    <>
      <div className="flex items-center mb-8 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/account/orders">
            <Button variant="outline">
              <ChevronLeft />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold">Order Details</h2>
        </div>

        <Badge
          variant={paymentStatusBadgeVariant}
          className="lg:text-base lg:px-6 gap-2"
        >
          {paymentStatus}
          {paymentStatus === "PAID" && (
            <BadgeCheck className="scale-125lg:scale-150" />
          )}
          {paymentStatus === "PENDING" && (
            <Clock className="scale-125 lg:scale-150" />
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-4 items-start">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-4">
              <PackageOpen className="w-6 h-6" />
              Order Items
            </CardTitle>
          </CardHeader>
          <>
            {orderItems.map((item, index) => {
              const imageUrl = item.products?.banner_image_url;
              const productName = item.product_name;
              const productCode = item.products?.product_code;
              const sizeName = item.sizes?.name;
              const colorName = item.colors?.name;
              const quantity = item.quantity;
              const finalPrice = item.total_price;
              const hasDiscount = item.discount_percentage > 0;
              const discountPercentage = item.discount_percentage;
              const unitPrice = item.unit_price;
              const saveAmount = item.unit_price - item.total_price;

              return (
                <CardContent
                  key={item.id}
                  className={`flex items-start gap-3 ${
                    index === orderItems.length - 1
                      ? "pb-0"
                      : "pb-6 border-b border-border"
                  }`}
                >
                  <div className="relative w-24 h-24 lg:w-40 lg:h-40">
                    <Image
                      src={imageUrl}
                      alt="Order Item"
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="flex flex-1 flex-col space-y-1 h-40">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold line-clamp-1">
                        {productName}
                      </span>
                      {hasDiscount && (
                        <Badge variant="destructive">
                          {discountPercentage}% off
                        </Badge>
                      )}
                    </div>
                    <div className="space-x-2">
                      <span className="text-xs lg:text-sm">Code:</span>
                      <Badge className="font-mono" variant="outline">
                        {productCode}
                      </Badge>{" "}
                    </div>
                    <span className="text-xs lg:text-sm">
                      Quantity: {quantity}
                    </span>
                    <div className="flex items-end justify-between mt-auto">
                      <span className="text-muted-foreground text-xs lg:text-sm">
                        {colorName} / {sizeName}
                      </span>

                      <div className="flex flex-col items-end font-jost">
                        {hasDiscount ? (
                          <div className="flex flex-col items-end space-y-1 text-xs lg:text-sm">
                            <span className="text-muted-foreground line-through">
                              {formatCurrency(unitPrice)}
                            </span>
                            <span className="text-muted-foreground">
                              &minus;{formatCurrency(saveAmount)}
                            </span>
                            <span className="font-semibold text-base lg:text-lg">
                              {formatCurrency(finalPrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-base lg:text-lg">
                            {formatCurrency(finalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              );
            })}
          </>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2.5">
                <CircleDollarSign className="w-6 h-6" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent
              className={`flex flex-col space-y-2.5 ${
                hasPromoCode ? "h-58" : "h-40"
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Payment Method</span>
                <span className="text-muted-foreground">{paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Subtotal</span>
                <span className="text-muted-foreground">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {hasPromoCode && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Coupon Applied</span>
                    <span className="text-success font-medium">
                      {promoCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Coupon Discount</span>
                    <span className="text-success font-medium">
                      {promoDiscount}% off
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Delivery Fee</span>
                <span className="text-muted-foreground">
                  {formatCurrency(0)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Save</span>
                <span className="text-muted-foreground">
                  {formatCurrency(saveAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mt-auto">
                <span className="font-medium">Paid Amount</span>
                <span className="font-semibold text-base">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2.5">
                <MapPinHouse />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Name</span>
                <span className="text-muted-foreground">{fullName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Telephone</span>
                <span className="text-muted-foreground">{telephone}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Address</span>
                <span className="text-muted-foreground">
                  {cityProvince}, {country}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
