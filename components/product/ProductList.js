import Link from "next/link";
import { Button } from "../ui/button";
import ProductItem from "./ProductItem";

export default function ProductList({ products }) {
  return (
    <div className="overflow-x-auto pb-4">
      <ul className="flex space-x-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:space-x-0">
        {products.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            className="flex-shrink-0 w-64"
          />
        ))}
        {/* Placeholder item to push the "View all" button */}
        {/* This item takes up space equivalent to the button's width */}
        <li className="flex-shrink-0 w-64 pointer-events-none lg:hidden">
          {/* Invisible placeholder matching item width */}
          <div className="h-full w-full flex flex-col items-center justify-center group">
            <Button size="lg" className="font-semibold text-sm lg:text-base">
              <Link href="/">View all</Link>
            </Button>
          </div>
        </li>
      </ul>
    </div>
  );
}
