import Link from "next/link";
import { Button } from "../ui/button";
import ProductList from "../product/ProductList";
import { MoveRight } from "lucide-react";

export default function ShopAllSection({ products }) {
  return (
    <div className="my-6 lg:my-12 space-y-8 pt-6 border-t border-border">
      <h2 className="text-4xl lg:text-[2.7rem] font-poppins font-bold uppercase">
        Shop All
      </h2>

      <ProductList products={products} variant="scroll" />

      <div className="flex justify-center group">
        <Link href="/products">
          <Button
            size="lg"
            className="font-semibold text-sm lg:text-base hidden lg:inline-flex"
          >
            View all
          </Button>
        </Link>
      </div>
    </div>
  );
}
