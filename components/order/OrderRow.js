import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "../ui/checkbox";
import { formatCurrency, formatISODateToDayDateMonthYear } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";

export default function OrderRow({ order }) {
  console.log(order);
  const orderNumber = order.order_number;
  const totalAmount = formatCurrency(order.total_amount);
  const customerName = order.customer_name;
  const customerEmail = order.customer_email;
  const createdAt = formatISODateToDayDateMonthYear(order.created_at);
  const paymentStatus = order.payment_status;
  const status = order.status;

  const imageAlt = order.order_items?.[0]?.product_name || orderNumber;
  const bannerImageUrl =
    order.order_items?.[0]?.products?.banner_image_url ||
    "/placeholder-image.jpg";

  // Status badge variants
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
        return "outline";
      case "SHIPPED":
        return "default";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
  };

  const getPaymentBadgeVariant = (status) => {
    switch (status) {
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      case "FAILED":
        return "destructive";
      case "REFUNDED":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <TableRow className="text-sm">
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell className="flex items-center gap-4">
        <div className="relative w-14 h-14">
          <Image
            src={bannerImageUrl}
            alt={imageAlt}
            fill
            className="object-cover object-center"
          />
        </div>
        <span>{orderNumber}</span>
      </TableCell>
      <TableCell>{totalAmount}</TableCell>
      <TableCell className="space-y-1">
        <p className="font-medium">{customerName}</p>
        <p className="text-xs text-muted-foreground">{customerEmail}</p>
      </TableCell>
      <TableCell>{createdAt}</TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant={getPaymentBadgeVariant(paymentStatus)}
          className="text-xs"
        >
          {paymentStatus}
        </Badge>
      </TableCell>
      <TableCell>
        <Link href={`/admin/orders/${order.id}`}>
          <Button variant="ghost" size="sm">
            <Eye />
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}
