import {
  getAllColors,
  getAllSizes,
  getAllCategories,
  getAllSubcategories,
} from "@/lib/apiProducts";
import ProductCreateForm from "@/components/ProductCreateForm";

export default async function AdminAddProductPage() {
  const { colors } = await getAllColors();
  const { sizes } = await getAllSizes();
  const { categories } = await getAllCategories();
  const { subcategories } = await getAllSubcategories();

  return (
    <ProductCreateForm
      colors={colors}
      sizes={sizes}
      categories={categories}
      subcategories={subcategories}
    />
  );
}
