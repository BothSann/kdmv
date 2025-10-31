import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { DollarSign, Loader2, ShoppingCart } from "lucide-react";
import useCartStore from "@/store/useCartStore";
import { Badge } from "./ui/badge";
import CartItem from "./CartItem";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import EmptyState from "./EmptyState";

export default function CartDrawer() {
  const { items, itemCount, totalPrice, isDrawerOpen, setDrawerOpen } =
    useCartStore();
  const hasHydrated = useCartStore((state) => state._hasHydrated);

  const count = itemCount();
  const total = totalPrice();

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative">
          <ShoppingCart className="scale-125" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute rounded-full h-4.5 w-4.5 top-0 right-0 font-normal flex items-center justify-center"
            >
              {count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[90%] md:w-3/4 md:max-w-lg px-4 lg:px-8 pt-4 pb-2 lg:py-6 dark:bg-primary-foreground"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="px-0 py-0 lg:py-4">
          <SheetTitle className="text-xl lg:text-2xl font-bold">
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 && (
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            description="Add some items to get started"
          />
        )}

        {items.length > 0 && (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto pt-4 lg:pt-8 border-t border-border scrollbar-hide">
              <div className="space-y-10">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <SheetFooter className="px-0 pb-0 pt-4 lg:pt-6 border-t border-border">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="uppercase text-base lg:text-xl font-bold tracking-widest">
                    Subtotal
                  </span>
                  <span className="text-lg lg:text-xl font-jost">
                    {formatCurrency(total)}
                  </span>
                </div>

                <SheetDescription className="text-sm font-jost w-full lg:w-80 leading-tight">
                  Shipping, taxes, and coupon codes calculated at checkout.
                </SheetDescription>

                <div className="space-y-1.5">
                  <Button
                    className="w-full gap-1 lg:gap-2 py-4 lg:py-6 mt-4 text-sm lg:text-base"
                    size="lg"
                    asChild
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Link href="/checkouts">
                      <DollarSign className="scale-90 lg:scale-105" />
                      Checkout
                    </Link>
                  </Button>

                  <Button
                    variant="link"
                    size="sm"
                    asChild
                    className="w-full font-normal text-xs lg:text-sm"
                  >
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
