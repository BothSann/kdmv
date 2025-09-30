import {
  getAllColors,
  getAllSizes,
  getAllCategories,
  getAllSubcategories,
} from "@/lib/apiProducts";

import { getAllCollections } from "@/lib/apiCollections";
import ProductCreateEditForm from "@/components/product/ProductCreateEditForm";

export default async function AdminAddProductPage() {
  const { colors } = await getAllColors();
  const { sizes } = await getAllSizes();
  const { categories } = await getAllCategories();
  const { subcategories } = await getAllSubcategories();
  const { collections } = await getAllCollections();

  return (
    <ProductCreateEditForm
      colors={colors}
      sizes={sizes}
      categories={categories}
      subcategories={subcategories}
      collections={collections}
    />
  );
}
