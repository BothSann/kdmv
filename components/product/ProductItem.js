"use client";

import { cn, formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";

export default function ProductItem({ product, className, index }) {
  const discountedPrice = product.discounted_price;
  const discountPercentage = product.discount_percentage;
  const hasDiscount = product.discount_percentage > 0;

  return (
    <motion.li
      key={product.id}
      className={cn(className)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/products/${product.id}`}>
        {/* Product Image */}
        <motion.div
          className="relative aspect-[3/4]"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10px" }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
        >
          <Image
            alt={product.name}
            src={product.banner_image_url}
            fill
            quality={50}
            sizes="100vw"
            className="object-cover object-center"
          />

          {hasDiscount && (
            <motion.div
              initial={{ opacity: 0, x: 20, y: -20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-10px" }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
            >
              <Badge
                variant="destructive"
                className="absolute top-0 right-0 z-10 text-sm lg:text-base uppercase font-jost font-normal tracking-widest lg:px-2.5"
              >
                {discountPercentage}% off
              </Badge>
            </motion.div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          className="py-4 px-2 flex flex-col gap-0.5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10px" }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
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
        </motion.div>
      </Link>
    </motion.li>
  );
}
