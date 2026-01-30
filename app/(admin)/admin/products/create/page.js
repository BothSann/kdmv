import {
  getAllColors,
  getAllSizes,
  getAllProductTypes,
} from "@/lib/data/products";

import { getAllCollections } from "@/lib/data/collections";
import ProductCreateEditForm from "@/components/product/ProductCreateEditForm";

export default async function AdminAddProductPage() {
  const { colors } = await getAllColors();
  const { sizes } = await getAllSizes();
  const { productTypes } = await getAllProductTypes();
  const { collections } = await getAllCollections();

  return (
    <ProductCreateEditForm
      colors={colors}
      sizes={sizes}
      productTypes={productTypes}
      collections={collections}
    />
  );
}
