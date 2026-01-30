import {
  getAllColors,
  getAllSizes,
  getAllProductTypes,
  getAllGenders,
} from "@/lib/data/products";

import { getAllCollections } from "@/lib/data/collections";
import ProductCreateEditForm from "@/components/product/ProductCreateEditForm";

export default async function AdminAddProductPage() {
  const { colors } = await getAllColors();
  const { sizes } = await getAllSizes();
  const { productTypes } = await getAllProductTypes();
  const { genders } = await getAllGenders();
  const { collections } = await getAllCollections();

  return (
    <ProductCreateEditForm
      colors={colors}
      sizes={sizes}
      productTypes={productTypes}
      genders={genders}
      collections={collections}
    />
  );
}
