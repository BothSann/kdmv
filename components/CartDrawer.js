import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Handbag, Trash } from "lucide-react";

export default function CartDrawerII() {
  return (
    <Sheet>
      <SheetTrigger>
        <Handbag className="cursor-pointer" />
      </SheetTrigger>
      <SheetContent className="md:max-w-lg p-0">
        <div className="grid grid-rows-[auto_1fr_auto] h-full">
          {/* Header - Fixed */}
          <CartHeader />
          {/* Scrollable middle section - Product items go here */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
            {/* Product Item 1 */}
            <CartItem />
          </div>
          {/* Footer - Fixed */}
          <PaymentSummary />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CartItem() {
  return (
    <div className="flex gap-4">
      <div className="relative w-40 h-48 flex-shrink-0">
        <Image
          src="/detailcarousel1.jpg"
          alt="color1"
          fill
          quality={100}
          className="object-cover object-top"
        />
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {/* Product name and code block and trash button */}
        <div className="flex justify-between">
          <div>
            <p className="font-medium">Relaxed T-Shirt With Printed</p>
            <p className="text-sm text-gray-600">
              Code. <span>21225031246</span> &mdash; <span>White</span>
            </p>
          </div>
          <Button className="cursor-pointer" variant="ghost" size="icon">
            <Trash size={20} />
          </Button>
        </div>

        {/* Size and quantity block */}
        <div className="flex gap-4">
          <div>
            <p className="text-sm text-gray-600">Size</p>
            <p>M</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Quantity</p>
            <p>2</p>
          </div>
        </div>

        {/* Pushed to bottom */}
        <div className="flex flex-col gap-0.5 items-end mt-auto">
          <p className="text-sm text-gray-600">Original Price</p>
          <p className="text-sm">
            (Discount Percentage) &mdash; (Discounted Price)
          </p>
          <p className="text-pink-500 font-medium">Total</p>
        </div>
      </div>
    </div>
  );
}

function PaymentSummary() {
  return (
    <div className="shrink-0 border-t">
      <SheetFooter>
        <div className="pb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-medium">Amount to pay</h3>
            <span className="text-2xl font-semibold">US $26.32</span>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center text-lg">
              <span>Total</span>
              <span className="font-medium">US $44.49</span>
            </div>

            <div className="flex justify-between items-center text-lg">
              <span>Save</span>
              <span className="font-medium text-green-600">-US $19.17</span>
            </div>

            <div className="flex justify-between items-center text-lg">
              <span>Delivery fee</span>
              <span className="font-medium">US $1</span>
            </div>
          </div>
        </div>

        <Button className="text-lg py-6 w-full cursor-pointer">Checkout</Button>
      </SheetFooter>
    </div>
  );
}

function CartHeader() {
  return (
    <div className="shrink-0 border-b">
      <SheetHeader>
        <SheetTitle className="text-2xl">Your Cart</SheetTitle>
      </SheetHeader>
    </div>
  );
}
