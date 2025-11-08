import Link from "next/link";
import { Button } from "../ui/button";
import ProductItem from "./ProductItem";

export default function ProductList({
  products,
  variant = "grid", // "scroll" | "grid"
}) {
  // Layout classes based on variant
  const containerClasses =
    variant === "scroll"
      ? "overflow-x-auto pb-4" // Horizontal scroll
      : ""; // No horizontal scroll

  const listClasses =
    variant === "scroll"
      ? "flex space-x-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:space-x-0" // Scroll -> Grid
      : "grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"; // 2-col -> 4-col

  const itemClasses =
    variant === "scroll"
      ? "flex-shrink-0 w-64 lg:w-full" // Fixed width for scroll
      : ""; // Responsive width for grid

  return (
    <div className={containerClasses}>
      <ul className={listClasses}>
        {products.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            className={itemClasses}
          />
        ))}

        {/* Only show placeholder for scroll variant */}
        {variant === "scroll" && (
          <li className="flex-shrink-0 w-64 lg:hidden">
            <div className="h-full w-full flex flex-col items-center justify-center group">
              <Link href="/products">
                <Button className="font-semibold text-sm lg:text-base">
                  View all
                </Button>
              </Link>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
