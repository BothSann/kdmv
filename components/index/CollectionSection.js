"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import ProductList from "../product/ProductList";
import { MoveRight } from "lucide-react";

export default function CollectionSection({ collection, products, index }) {
  return (
    <div
      className={`my-6 lg:my-12 space-y-8 pb-6 ${
        index !== 0 ? "border-t border-border pt-6" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-4xl lg:text-[2.7rem] font-poppins font-bold">
          {collection.name}
        </h2>

        <div className="flex justify-center group self-start">
          <Link href="/" className="flex items-center gap-1.5">
            <Button variant="link" className="hidden lg:inline-flex text-base">
              View all
              <MoveRight className="scale-0 translate-x-2 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-300 ease-in-out" />
            </Button>
          </Link>
        </div>
      </div>

      <ProductList products={products} variant="scroll" />
    </div>
  );
}
