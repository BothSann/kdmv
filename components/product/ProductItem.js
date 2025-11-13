import { cn, formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";

export default function ProductItem({ product, className }) {
  const discountedPrice = product.discounted_price;
  const discountPercentage = product.discount_percentage;
  const hasDiscount = product.discount_percentage > 0;

  return (
    <li
      key={product.id}
      className={cn(className)}
      data-aos="fade-up"
      data-aos-duration="600"
      data-aos-once="false"
    >
      <Link href={`/products/${product.id}`}>
        {/* Product Image */}
        <div className="relative aspect-[3/4]">
          <Image
            alt={product.name}
            src={product.banner_image_url}
            fill
            loading="lazy"
            quality={50}
            sizes="100vw"
            className="object-cover object-center"
            data-aos="zoom-in"
            data-aos-duration="500"
            data-aos-delay="100"
          />

          {hasDiscount && (
            <div
              data-aos="fade-down-left"
              data-aos-duration="400"
              data-aos-delay="200"
            >
              <Badge
                variant="destructive"
                className="absolute top-0 right-0 z-10 text-sm lg:text-base uppercase font-jost font-normal tracking-widest lg:px-2.5"
              >
                {discountPercentage}% off
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div
          className="py-4 px-2 flex flex-col gap-0.5"
          data-aos="fade-up"
          data-aos-duration="500"
          data-aos-delay="200"
        >
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
