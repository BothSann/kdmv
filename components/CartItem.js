import Image from "next/image";
import { Button } from "./ui/button";
import { Minus, Plus, Trash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Input } from "./ui/input";
import useCartStore from "@/store/useCartStore";

export default function CartItem({ item }) {
  const variant = item.variant;
  const product = variant.product;

  const removeFromCart = useCartStore((state) => state.removeFromCart);

  return (
    <div className="flex gap-4">
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={product.banner_image_url}
          alt={product.name}
          fill
          className="object-cover object-center"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 space-y-2">
        <h4 className="font-jost text-lg line-clamp-1">{product.name}</h4>

        {/* Color and Size */}
        <div className="text-sm text-muted-foreground flex flex-col">
          <span>Color: {variant.colors?.name}</span>
          <span>Size: {variant.sizes?.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="outline" size="sm">
              <Minus className="scale-80" />
            </Button>
            <Input
              value={item.quantity}
              onChange={(e) => {
                e.preventDefault();
              }}
              className="w-16 focus-visible:ring-0 text-center md:text-base"
            />
            <Button variant="outline" size="sm">
              <Plus className="scale-80 " />
            </Button>
          </div>

          <span className="text-lg font-jost">
            {formatCurrency(item.variant.product.base_price * item.quantity)}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={() => removeFromCart(item.id)}
      >
        <Trash />
      </Button>
    </div>
  );
}
