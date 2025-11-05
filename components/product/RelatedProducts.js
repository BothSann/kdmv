import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import ProductList from "./ProductList";

export default function RelatedProducts({
  products,
  title = "You May Also like",
}) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <>
      {/* Section Title */}
      <h2 className="text-[2.7rem] font-bold">{title}</h2>

      <ProductList products={products} variant="grid" />
    </>
  );
}
