import { Heart } from "lucide-react";
import Image from "next/image";

export default function ProductItem({ product }) {
  return (
    <li key={product.id} className="group">
      <div className="relative aspect-[3/4]">
        <Image
          alt={product.imageAlt}
          src="/clothes2.jpg"
          fill
          className="object-contain"
        />
      </div>

      <div className="mt-2.5 flex justify-between">
        <div className="flex flex-col">
          <span className="text-pink-500 font-bold text-lg">
            US ${product.price}
          </span>
          <span className="text-lg text-gray-900 dark:text-gray-50">
            {product.name}
          </span>
        </div>

        <button className="cursor-pointer flex items-start justify-center">
          <Heart size={20} />
        </button>
      </div>
    </li>
  );
}
