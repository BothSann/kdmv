import Image from "next/image";

import { Badge } from "./ui/badge";

import { formatCurrency } from "@/lib/utils";

export default function CheckoutItem({ item }) {
  const variant = item.variant;
  const product = variant.product;

  const hasDiscount = product.discount_percentage > 0;
  const discountPercentage = product.discount_percentage;
  const discountedPrice = product.base_price * (1 - discountPercentage / 100);

  return (
    <div className="flex gap-8 pt-4">
      {/* Product Image */}
      <div className="relative w-18 h-18 flex-shrink-0">
        <Image
          src={product.banner_image_url}
          alt={product.name}
          fill
          className="object-cover object-center"
        />

        <Badge
          className="absolute -top-2 -right-2 w-4.5 h-4.5 text-xs rounded-xs dark:bg-orange-500/80 dark:text-foreground/90"
          variant=""
        >
          {item.quantity}
        </Badge>
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h4 className="font-jost text-lg line-clamp-1">{product.name}</h4>
            {/* Color and Size */}

            <div className="text-sm text-muted-foreground font-medium">
              <span>
                {variant.colors?.name} / {variant.sizes?.name}
              </span>
              <p>Quantity: {item.quantity}</p>
            </div>
          </div>

          <span className="self-start">
            {hasDiscount ? (
              <div className="flex flex-col items-end">
                <span className="text-lg font-jost">
                  {formatCurrency(discountedPrice * item.quantity)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.base_price * item.quantity)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-jost">
                {formatCurrency(
                  item.variant.product.base_price * item.quantity
                )}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
