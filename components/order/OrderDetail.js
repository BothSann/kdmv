import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency,
  formatISODateToDayDateMonthYearWithAtTime,
} from "@/lib/utils";

import {
  BadgeCheck,
  CircleCheckBig,
  CircleDollarSign,
  Contact,
  MapPinHouse,
  PackageCheck,
  PackageOpen,
  ShoppingBag,
  TruckElectric,
  CircleX,
  History,
  Package,
} from "lucide-react";

import Image from "next/image";
import OrderStatusUpdateDialog from "./OrderStatusUpdateDialog";

export default function OrderDetail({ order, role }) {
  console.log("Order Status History", order?.order_status_history);
  const isAdmin = role === "admin";
  const adminId = order?.admin_id;

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

  const deliveryStatus = order?.status; // Status inside order table

  const customerName = order?.customer_name;
  const customerEmail = order?.customer_email;
  const customerPhone = order?.customer_phone;

  const orderHistory = order?.order_status_history || [];

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
        IconComponent = isComplete ? CircleCheckBig : Package;
        break;
      case "shipped":
        isComplete =
          deliveryStatus === "SHIPPED" || deliveryStatus === "DELIVERED";
        IconComponent = isComplete ? CircleCheckBig : TruckElectric;
        break;
      case "delivered":
        isComplete = deliveryStatus === "DELIVERED";
        IconComponent = isComplete ? CircleCheckBig : PackageCheck;
        break;
      case "cancelled":
        isComplete = deliveryStatus === "CANCELLED";
        IconComponent = isComplete ? CircleCheckBig : CircleX;
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
  const cancelledStep = getStepConfig("cancelled");

  return (
    <>
      <OrderDeliveryStatusCard
        processingStep={processingStep}
        preparingStep={preparingStep}
        shippedStep={shippedStep}
        deliveredStep={deliveredStep}
        cancelledStep={cancelledStep}
        isAdmin={isAdmin}
        order={order}
        adminId={adminId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-4 items-start">
        <div className="space-y-4">
          <OrderItemsCard orderItems={orderItems} />
          <OrderHistoryTimeline orderHistory={orderHistory} />
        </div>

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
  deliveryStatus,
  processingStep,
  preparingStep,
  shippedStep,
  deliveredStep,
  cancelledStep,
  isAdmin,
  order,
  adminId,
}) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Delivery Status
          {isAdmin && (
            <OrderStatusUpdateDialog order={order} adminId={adminId} />
          )}
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
          {/* Step 5: Cancelled (CANCELLED) */}
          {deliveryStatus === "CANCELLED" && (
            <div className="flex flex-col items-center gap-2">
              <div
                className={`rounded-full p-2 flex items-center justify-center ${cancelledStep.className}`}
              >
                <cancelledStep.IconComponent className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <span className="text-xs lg:text-sm">Cancelled</span>
            </div>
          )}
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
          Product Details
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

          <Badge variant={paymentStatusBadgeVariant} className="gap-2 text-xs">
            {paymentStatus}
            <BadgeCheck className="scale-125" />
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

export function OrderHistoryTimeline({ orderHistory }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return ShoppingBag;
      case "CONFIRMED":
        return PackageCheck;
      case "SHIPPED":
        return TruckElectric;
      case "DELIVERED":
        return PackageCheck;
      case "CANCELLED":
        return CircleX;
      default:
        return PackageCheck;
    }
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Order Placed";
      case "CONFIRMED":
        return "Order Confirmed";
      case "SHIPPED":
        return "Order Shipped";
      case "DELIVERED":
        return "Order Delivered";
      case "CANCELLED":
        return "Order Cancelled";
      default:
        return status;
    }
  };

  // Helper function to get icon background color
  const getStatusIconColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-warning text-white";
      case "CONFIRMED":
        return "bg-primary text-primary-foreground";
      case "SHIPPED":
        return "bg-tertiary text-white";
      case "DELIVERED":
        return "bg-success text-white";
      case "CANCELLED":
        return "bg-destructive text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Check if orderHistory exists and has items
  if (!orderHistory || orderHistory.length === 0) {
    return null; // Don't render if no history
  }

  // Sort history by changed_at (oldest first)
  const sortedHistory = [...orderHistory].sort(
    (a, b) => new Date(a.changed_at) - new Date(b.changed_at)
  );

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2.5">
          <History />
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-8">
        <div className="relative">
          {/* Timeline vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

          {/* Timeline items */}
          <div className="space-y-8">
            {sortedHistory.map((history, index) => {
              const StatusIcon = getStatusIcon(history.status);
              const iconColor = getStatusIconColor(history.status);
              const statusLabel = getStatusLabel(history.status);
              const changedBy = history.profiles
                ? `${history.profiles.first_name} ${history.profiles.last_name}`
                : "System";
              const isLast = index === sortedHistory.length - 1;

              return (
                <div
                  key={history.id}
                  className={`flex items-start gap-4 ${!isLast ? "pb-4" : ""}`}
                >
                  {/* Icon */}
                  <div
                    className={`${iconColor} rounded-full p-2 flex items-center justify-center relative z-10`}
                  >
                    <StatusIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1.5 lg:space-y-2">
                    {/* Status label */}
                    <p className="text-base font-semibold">{statusLabel}</p>

                    {/* Notes and timestamp */}
                    <div className="space-y-0.5">
                      {history.notes && (
                        <p className="text-sm text-muted-foreground">
                          {history.notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatISODateToDayDateMonthYearWithAtTime(
                          history.changed_at
                        )}
                      </p>
                    </div>

                    {/* Changed by */}
                    <p className="text-xs text-muted-foreground">
                      Modified by:{" "}
                      <span className="font-medium">{changedBy}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
