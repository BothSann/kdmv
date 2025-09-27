"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import CollectionSection from "./CollectionSection";
import ShopAllSection from "./ShopAllSection";

export default function HomePageClient({ data }) {
  useEffect(() => {
    if (data.collectionsWithProducts.some((c) => c.error)) {
      toast.error("Some collections failed to load");
    }
  }, [data]);

  return (
    <div>
      {/* Featured Collections */}
      {data.collectionsWithProducts.map((collection, index) => (
        <CollectionSection
          key={collection.id}
          collection={collection}
          products={collection.products}
          index={index}
        />
      ))}

      {/* Featured Products */}
      <ShopAllSection products={data.featuredProducts} />
    </div>
  );
}
