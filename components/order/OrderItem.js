import {
  formatCurrency,
  formatISODateToDayDateMonthYear,
  formatISODateToDayMonthNameYear,
} from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import Link from "next/link";

export default function OrderItem({ order }) {
  const orderId = order.id;
  const orderNumber = order.order_number;
  const date = order.created_at;
  const totalAmount = order.total_amount;
  const status = order.status;
  const itemCount = order.item_count;
  const totalQuantity = order.total_quantity;

  const hasSingleItem = order.items && order.items.length === 1;
  const singleItemName = hasSingleItem ? order.items[0]?.product_name : null;

  // Determine the badge variant based on status
  const getBadgeVariant = (status) => {
    switch (status) {
      case "PENDING":
      case "CONFIRMED":
        return "warning";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "destructive";
      default:
        return "default"; // Or another appropriate default variant
    }
  };

  const statusTextToDisplay = (status) => {
    switch (status) {
      case "PENDING":
        return "Processing";
      case "CONFIRMED":
        return "Preparing Order";
      case "DELIVERED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <Link href={`/account/orders/${orderId}`}>
      <Card className="mt-6 cursor-pointer">
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between text-sm flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0">
            <Badge variant="outline" className="text-sm lg:text-base font-mono">
              {orderNumber}
            </Badge>
            <span className="text-xs lg:text-sm text-muted-foreground">
              {formatISODateToDayMonthNameYear(date)}
            </span>
            <div className="text-lg font-semibold flex items-center justify-between w-full lg:w-auto lg:justify-end">
              {formatCurrency(totalAmount)}
              <ChevronRight className="text-muted-foreground" size={24} />
            </div>
          </div>

          <div className="space-x-3 text-sm">
            <Badge className="font-semibold" variant={getBadgeVariant(status)}>
              {statusTextToDisplay(status)}
            </Badge>
            <span>Qty. {totalQuantity}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="self-end text-sm lg:text-base line-clamp-1">
              {hasSingleItem ? singleItemName : `${itemCount} items`}
            </span>
            <div className="flex gap-2 overflow-x-auto">
              {/* Flex container for images */}
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="relative w-18 h-18 lg:w-32 lg:h-32"
                  >
                    {/* Use item.id if available as key */}
                    <Image
                      src={item.banner_image_url} // Use the image URL from the item
                      alt={item.product_name || "Product"} // Use product name for alt text if available
                      fill
                      sizes="(max-width: 1024px) 72px, 128px"
                      quality={50}
                      loading="lazy"
                      className="object-cover object-center"
                    />
                  </div>
                ))
              ) : (
                // Optional: Render a placeholder if no items exist
                <div className="relative w-32 h-32 border border-dashed flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No Image</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
