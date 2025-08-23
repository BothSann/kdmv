import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProductItem({ product }) {
  return (
    <li key={product.id} className="group">
      <Link href="/details">
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
        alt={product.imageAlt}
        src="/clothes2.jpg"
        fill
        className="object-contain"
      />
    </div>
  );
}

function ProductInfo({ product }) {
  return (
    <div className="mt-2.5 flex justify-between">
      <div className="flex flex-col">
        <span className="text-pink-500 font-bold text-lg">
          US ${product.price}
        </span>
        <span className="text-lg text-zinc-950 dark:text-zinc-50">
          {product.name}
        </span>
      </div>

      <button className="cursor-pointer flex items-start justify-center">
        <Heart size={20} />
      </button>
    </div>
  );
}
