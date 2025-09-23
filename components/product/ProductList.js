import Link from "next/link";
import ProductItem from "./ProductItem";
import { Button } from "../ui/button";

export default function ProductList({ products }) {
  return (
    <>
      <div className="mt-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[2.7rem] font-poppins font-bold">
            Straight Edge Collection
          </h2>

          <Button className="text-lg" variant={"link"}>
            <Link href="/products">View All</Link>
          </Button>
        </div>

        <ul className="grid grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </ul>
      </div>
    </>
  );
}
