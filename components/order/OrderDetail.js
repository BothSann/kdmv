import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import {
  BadgeCheck,
  ChevronLeft,
  CircleCheckBig,
  CircleDollarSign,
  Contact,
  MapPinHouse,
  PackageCheck,
  PackageOpen,
  TruckElectric,
} from "lucide-react";

import Image from "next/image";
import OrderStatusUpdateDialog from "./OrderStatusUpdateDialog";

export default function OrderDetail({ order, role }) {
  // console.log("Order Status History", order?.order_status_history);
  const isAdmin = role === "admin";

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

  const deliveryStatus = order?.status;

  const customerName = order?.customer_name;
  const customerEmail = order?.customer_email;
  const customerPhone = order?.customer_phone;

  // Helper function to determine styling and icon components for each step
  const getStepConfig = (stepKey) => {
    let isComplete = false;
    let bgColor = "bg-ring/20"; // Default pending background
    let textColor = "text-ring"; // Default pending text
    let IconComponent = null; // Default icon placeholder

    switch (stepKey) {
      case "processing":
        isComplete =
          deliveryStatus === "PENDING" ||
          deliveryStatus === "CONFIRMED" ||
          deliveryStatus === "SHIPPED" ||
          deliveryStatus === "DELIVERED";
        IconComponent = isComplete ? CircleCheckBig : PackageOpen;
        break;
      case "preparing":
        isComplete =
          deliveryStatus === "CONFIRMED" ||
          deliveryStatus === "SHIPPED" ||
          deliveryStatus === "DELIVERED";
        IconComponent = isComplete ? CircleCheckBig : PackageCheck;
        break;
      case "shipped":
        isComplete =
          deliveryStatus === "SHIPPED" || deliveryStatus === "DELIVERED";
        IconComponent = isComplete ? CircleCheckBig : TruckElectric;
        break;
      case "delivered":
        isComplete = deliveryStatus === "DELIVERED";
        IconComponent = isComplete ? CircleCheckBig : PackageCheck; // Or another icon
        break;
      default:
        break;
    }

    if (isComplete) {
      bgColor = "bg-success";
      textColor = "text-white";
    }

    return {
      className: `${bgColor} ${textColor}`,
      IconComponent,
      isComplete,
    };
  };

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

  // Get configurations for each step
  const processingStep = getStepConfig("processing");
  const preparingStep = getStepConfig("preparing");
  const shippedStep = getStepConfig("shipped");
  const deliveredStep = getStepConfig("delivered");

  return (
    <>
      <OrderDeliveryStatusCard
        processingStep={processingStep}
        preparingStep={preparingStep}
        shippedStep={shippedStep}
        deliveredStep={deliveredStep}
        isAdmin={isAdmin}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-4 items-start">
        <OrderItemsCard orderItems={orderItems} />

        <div className="flex flex-col gap-4">
          <OrderSummaryCard
            paymentMethod={paymentMethod}
            subtotal={subtotal}
            saveAmount={saveAmount}
            totalAmount={totalAmount}
            hasPromoCode={hasPromoCode}
            promoCode={promoCode}
            promoDiscount={promoDiscount}
            paymentStatus={paymentStatus}
            paymentStatusBadgeVariant={paymentStatusBadgeVariant}
          />

          {isAdmin && (
            <OrderCustomerInformationCard
              customerName={customerName}
              customerPhone={customerPhone}
              customerEmail={customerEmail}
            />
          )}

          <OrderShippingAddressCard
            cityProvince={cityProvince}
            country={country}
            fullName={fullName}
            telephone={telephone}
          />
        </div>
      </div>
    </>
  );
}

export function OrderDeliveryStatusCard({
  processingStep,
  preparingStep,
  shippedStep,
  deliveredStep,
  isAdmin,
}) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Delivery Status
          {isAdmin && <OrderStatusUpdateDialog />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Step 1: Processing (PENDING) */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`rounded-full p-2 flex items-center justify-center ${processingStep.className}`}
            >
              <processingStep.IconComponent className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <span className="text-xs lg:text-sm">Processing</span>
          </div>

          {/* Step 2: Preparing Order (CONFIRMED) */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`rounded-full p-2 flex items-center justify-center ${preparingStep.className}`}
            >
              <preparingStep.IconComponent className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <span className="text-xs lg:text-sm">Preparing Order</span>
          </div>

          {/* Step 3: Shipped (SHIPPED) */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`rounded-full p-2 flex items-center justify-center ${shippedStep.className}`}
            >
              <shippedStep.IconComponent className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <span className="text-xs lg:text-sm">Shipped</span>
          </div>

          {/* Step 4: Delivered (DELIVERED) */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`rounded-full p-2 flex items-center justify-center ${deliveredStep.className}`}
            >
              <deliveredStep.IconComponent className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <span className="text-xs lg:text-sm">Delivered</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderItemsCard({ orderItems }) {
  return (
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
                <span className="text-xs lg:text-sm">Quantity: {quantity}</span>
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
  );
}

export function OrderSummaryCard({
  paymentMethod,
  subtotal,
  saveAmount,
  totalAmount,
  hasPromoCode,
  promoCode,
  promoDiscount,
  paymentStatus,
  paymentStatusBadgeVariant,
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CircleDollarSign className="w-6 h-6" />
            <span>Order Summary</span>
          </div>

          <Badge
            variant={paymentStatusBadgeVariant}
            className="lg:text-base lg:px-4 gap-2"
          >
            {paymentStatus}
            <BadgeCheck className="scale-125 lg:scale-150" />
          </Badge>
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
              <span className="text-success font-medium">{promoCode}</span>
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
          <span className="text-muted-foreground">{formatCurrency(0)}</span>
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
  );
}

export function OrderCustomerInformationCard({
  customerName,
  customerPhone,
  customerEmail,
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2.5">
          <Contact />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Name</span>
          <span className="text-muted-foreground">{customerName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Telephone</span>
          <span className="text-muted-foreground">{customerPhone}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Email</span>
          <span className="text-muted-foreground">{customerEmail}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderShippingAddressCard({
  cityProvince,
  country,
  fullName,
  telephone,
}) {
  return (
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
  );
}
