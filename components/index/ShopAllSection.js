import Link from "next/link";
import { Button } from "../ui/button";
import ProductList from "../product/ProductList";

export default function ShopAllSection({ products }) {
  return (
    <div className="my-12 space-y-8 pt-20 border-t border-border">
      <h2 className="text-[2.185rem] lg:text-[2.7rem] font-poppins font-bold uppercase">
        Shop All
      </h2>

      <ProductList products={products} />

      <div className="flex justify-center group">
        <Button
          size="lg"
          className="font-semibold text-sm lg:text-base hidden lg:inline-flex"
        >
          <Link href="/">View all</Link>
        </Button>
      </div>
    </div>
  );
}
