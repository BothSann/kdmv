"use client";

import CheckoutItem from "@/components/CheckoutItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import useCartStore from "@/store/useCartStore";
import Spinner from "@/components/Spinner";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

export default function CheckoutsPage() {
  const { items, itemCount, totalPrice } = useCartStore();
  const hasHydrated = useCartStore((state) => state._hasHydrated);

  const count = itemCount();
  const total = totalPrice();

  // Show loading state until Zustand has hydrated from localStorage
  // This prevents hydration mismatch between server-rendered empty state
  // and client-side persisted state
  if (!hasHydrated) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 font-poppins">
      <div className="space-y-10 pr-10 border-r border-border">
        {/* Delivery Address */}
        <div>
          <h2 className="text-2xl font-bold mb-4 font-poppins">
            Delivery Address
          </h2>

          <Card>
            <CardContent className="flex gap-5 items-start">
              <Checkbox checked={true} className="mt-2" />
              <div className="flex flex-col gap-0.5">
                <p className="text-lg font-semibold">Both Sann</p>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Phnom Penh, Cambodia
                  </p>
                  <p className="text-sm text-muted-foreground">1234567890</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Items */}
        <div>
          <h2 className="text-2xl font-bold mb-8 font-poppins">
            Your Items ({count})
          </h2>
          <div className="space-y-6 max-h-[28rem] overflow-y-auto scrollbar-hide">
            {items.map((item) => (
              <CheckoutItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-10 pl-10">
        <div>
          {/* Payment Method */}
          <h2 className="text-2xl font-bold mb-4 font-poppins">
            Payment Method
          </h2>

          <Card>
            <CardContent className="flex items-center gap-5">
              <Checkbox checked={true} />

              <div className="flex items-center space-x-2">
                <div className="relative w-14 h-14">
                  <Image
                    fill
                    quality={100}
                    src="/ABABank.png"
                    alt="Kh QR"
                    className="object-contain"
                  />
                </div>

                <div className="font-source-sans-3">
                  <p className="uppercase font-bold -mb-2">ABA Pay</p>
                  <span className="text-xs">Scan to pay with ABA Mobile</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Coupon Code */}
          <h2 className="text-2xl font-bold mb-2.5 font-poppins">
            Coupon Code
          </h2>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <Label>Enter Coupon Code</Label>

              <div className="flex items-center gap-6">
                <Input placeholder="Enter coupon code" className="w-2/3" />
                <Button className="w-1/4">Apply</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Order Summary */}
          <h2 className="text-2xl font-bold mb-2.5 font-poppins">
            Order Summary
          </h2>

          <Card>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  Subtotal ({count})
                </span>
                <span className="">{formatCurrency(total)}</span>
              </div>

              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="">{formatCurrency(0)}</span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-xl font-semibold">
                  {formatCurrency(total)}
                </span>
              </div>

              <Button className="w-full py-6 mt-4 text-base font-semibold">
                <DollarSign className="scale-105" />
                Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
