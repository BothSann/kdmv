import {
  formatCurrency,
  formatISODateToDayDateMonthYear,
  formatISODateToDayMonthNameYear,
} from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";

export default function OrderItem({ order }) {
  console.log("order", order);
  const orderNumber = order.order_number;
  const date = order.created_at;
  const totalAmount = order.total_amount;
  const status = order.status;
  const itemCount = order.item_count;
  const totalQuantity = order.total_quantity;

  const hasSingleItem = order.items && order.items.length === 1;
  const singleItemName = hasSingleItem ? order.items[0]?.product_name : null;

  return (
    <Card className="mt-10 cursor-pointer">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span>{orderNumber}</span>
          <span>{formatISODateToDayDateMonthYear(date)}</span>
          <span className="text-lg font-semibold flex items-center gap-0.5">
            {formatCurrency(totalAmount)}
            <ChevronRight className="text-muted-foreground" size={24} />
          </span>
        </div>

        <div className="space-x-4 text-sm">
          <Badge className="font-semibold" variant="default">
            {status}
          </Badge>
          <span>{formatISODateToDayMonthNameYear(date)}</span>
          <span>Qty. {totalQuantity}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="self-end">
            {hasSingleItem ? singleItemName : `${itemCount} items`}
          </span>
          <div className="relative w-32 h-32">
            <Image
              src="/kdmv-shirt.webp"
              alt="Product"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
