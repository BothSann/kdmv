import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function ProductItem({ product }) {
  return (
    <li key={product.id}>
      <Link href={`/products/${product.id}`}>
        <ProductImage product={product} />
        <ProductInfo product={product} />
      </Link>
    </li>
  );
}

function ProductImage({ product }) {
  return (
    <div className="relative aspect-[3/4]">
      <Image
        alt={product.name}
        src={product.banner_image_url}
        fill
        className="object-cover object-center"
      />
    </div>
  );
}

function ProductInfo({ product }) {
  return (
    <div className="py-4 px-2 flex flex-col gap-0.5">
      <p className="text-lg">{product.name}</p>
      <p className=" font-jost text-primary/80">
        from {formatCurrency(product.base_price)}
      </p>
    </div>
  );
}
