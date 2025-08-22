import ProductDetailCarousel from "@/components/ProductDetailCarousel";
import { Button } from "@/components/ui/button";
import { Heart, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Detail() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left Side */}
      <div>
        <ProductDetailCarousel />
      </div>

      {/* Right Side */}
      <div>
        <div className="flex justify-between">
          <span className="text-xl">Wide Straight Trouser</span>
          <div>
            <button className="cursor-pointer flex items-start justify-center">
              <Heart size={24} />
            </button>
          </div>
        </div>

        {/* Product Price */}
        <div>
          <span className="text-pink-500 font-bold text-lg">US $120</span>
        </div>

        {/* Product Colors */}
        <div>
          <p className="text-2xl font-semibold">2 Colors available</p>
          <div className="flex gap-2">
            <div className="flex flex-col justify-center items-center gap-1.5">
              <div className="relative aspect-square w-40 h-48">
                <Image
                  src="/detailcarousel1.jpg"
                  alt="color1"
                  fill
                  quality={100}
                  className="object-cover object-top"
                />
              </div>
              <div>
                <p>Black</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Sizes */}
        <div>
          <div className="flex justify-between">
            <p className="text-2xl font-semibold">Size</p>
            <Link href="/size-guide">
              <p className="text-gray-600 underline">Size Guide</p>
            </Link>
          </div>
          <ul className="flex gap-2">
            <li>
              <Button className="w-20 rounded-none cursor-pointer text-lg">
                S
              </Button>
            </li>
            <li>
              <Button className="w-20 rounded-none cursor-pointer text-lg">
                M
              </Button>
            </li>
            <li>
              <Button className="w-20  rounded-none cursor-pointer text-lg">
                L
              </Button>
            </li>
            <li>
              <Button className="w-20 rounded-none cursor-pointer text-lg">
                XL
              </Button>
            </li>
            <li>
              <Button className="w-20 rounded-none cursor-pointer text-lg">
                XXL
              </Button>
            </li>
          </ul>
        </div>

        {/* Product Quantity */}
        <div>
          <p className="text-2xl font-semibold">Quantity</p>
          <div className="flex items-center gap-2">
            <Button className="w-12 rounded-none cursor-pointer ">
              <Minus size={28} />
            </Button>
            <Button className="w-12 rounded-none hover:bg-black">1</Button>
            <Button className="w-12 rounded-none cursor-pointer ">
              <Plus size={28} />
            </Button>
          </div>
        </div>

        {/* Product Description */}
        <div>
          <p className="text-lg font-semibold">21225031246</p>
          <p className="text-gray-500">
            Relaxed t-shirt featuring short sleeves with front design printed
            and round neck.
          </p>
        </div>

        {/* Add to Cart */}
        <div>
          <Button className="w-full rounded-none cursor-pointer text-lg py-6">
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
