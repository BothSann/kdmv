import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CircleCheck } from "lucide-react";
import {
  formatCurrency,
  formatISODateToDayDateMonthYearWithAtTime,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrderSuccessCard({
  orderNumber,
  totalItems,
  totalAmount,
  date,
  status,
}) {
  return (
    <Card className="font-poppins max-w-xl mx-auto gap-0">
      <div className="flex flex-col items-center justify-center space-y-2 px-6 pb-6">
        <CircleCheck size={76} className="fill-success text-white" />
        <h2 className="text-2xl font-bold">Order Successful</h2>
        <p className="text-muted-foreground text-center text-sm">
          Congratulations! Your order has been placed successfully. We&apos;re
          preparing your items and they&apos;ll be on their way soon.
        </p>
      </div>

      <CardContent className="self-start w-full pt-6 border-t border-border">
        <h3 className="text-lg font-semibold">Order Details</h3>

        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <Label className="">Order ID:</Label>
            <p className="text-sm">{orderNumber}</p>
          </div>
          <div className="flex items-center justify-between">
            <Label className="">Total Items:</Label>
            <p className="text-sm">{totalItems}</p>
          </div>
          <div className="flex items-center justify-between">
            <Label className="">Total Amount:</Label>
            <p className="text-sm">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="flex items-center justify-between">
            <Label className="">Date:</Label>
            <p className="text-sm">
              {formatISODateToDayDateMonthYearWithAtTime(date)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Label className="">Status:</Label>
            <p className="text-sm text-success">{status}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-8 flex justify-center items-center">
        <Button asChild>
          <Link href={`/orders/${orderNumber}`}>View Order</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
