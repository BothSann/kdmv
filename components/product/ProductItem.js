import { cn, formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";

export default function ProductItem({ product, className }) {
  const discountedPrice = product.discounted_price;
  const discountPercentage = product.discount_percentage;
  const hasDiscount = product.discount_percentage > 0;

  return (
    <li key={product.id} className={cn(className)}>
      <Link href={`/products/${product.id}`}>
        {/* Product Image */}
        <div className="relative aspect-[3/4]">
          <Image
            alt={product.name}
            src={product.banner_image_url}
            fill
            className="object-cover object-center"
          />

          {hasDiscount && (
            <Badge
              variant="destructive"
              className="absolute top-0 right-0 z-10 text-base"
            >
              {discountPercentage}% off
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="py-4 px-2 flex flex-col gap-0.5">
          <p className="text-lg">{product.name}</p>
          {hasDiscount ? (
            <p className="font-jost text-primary/80">
              {`from ${formatCurrency(product.base_price)} to ${formatCurrency(
                discountedPrice
              )}`}
            </p>
          ) : (
            <p className="font-jost text-primary/80">
              {formatCurrency(product.base_price)}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
