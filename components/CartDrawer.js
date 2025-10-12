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

import { DollarSign, ShoppingCart } from "lucide-react";
import useCartStore from "@/store/useCartStore";
import { Badge } from "./ui/badge";
import CartItem from "./CartItem";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import Spinner from "./Spinner";

export default function CartDrawer() {
  const { items, itemCount, totalPrice, isDrawerOpen, setDrawerOpen } =
    useCartStore();
  const hasHydrated = useCartStore((state) => state._hasHydrated);

  const count = itemCount();
  const total = totalPrice();

  if (!hasHydrated) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Spinner />
      </div>
    );
  }

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen} modal={false}>
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
        className="md:max-w-lg px-8 py-6 dark:bg-primary-foreground"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="px-0">
          <SheetTitle className="text-2xl font-bold ">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <div>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add some items to get started
              </p>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto pt-8 border-t border-border scrollbar-hide">
              <div className="space-y-10">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <SheetFooter className="px-0 pb-0 pt-6 border-t border-border">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="uppercase text-xl font-bold tracking-widest">
                    Subtotal
                  </span>
                  <span className="text-xl font-jost">
                    {formatCurrency(total)}
                  </span>
                </div>

                <SheetDescription className="text-sm font-jost w-80 leading-tight">
                  Shipping, taxes, and coupon codes calculated at checkout.
                </SheetDescription>

                <div className="space-y-1.5">
                  <Button
                    className="w-full py-6 mt-4 text-base"
                    size="lg"
                    asChild
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Link href="/checkouts">
                      <DollarSign className="scale-105" />
                      Checkout
                    </Link>
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    asChild
                    className="w-full font-normal"
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
