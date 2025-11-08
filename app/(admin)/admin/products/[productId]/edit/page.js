import {
  getAllColors,
  getAllSizes,
  getAllCategories,
  getAllSubcategories,
  getProductById,
} from "@/lib/api/products";
import { getAllCollections } from "@/lib/api/collections";
import ProductCreateEditForm from "@/components/product/ProductCreateEditForm";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { product } = await getProductById(resolvedParams.productId);

  return {
    title: `Edit ${product.name}`,
  };
}

export default async function AdminEditProductPage({ params }) {
  const resolvedParams = await params;
  const productId = resolvedParams.productId;

  const { colors } = await getAllColors();
  const { sizes } = await getAllSizes();
  const { categories } = await getAllCategories();
  const { subcategories } = await getAllSubcategories();
  const { collections } = await getAllCollections();

  // Fetch the product for editing
  const { product } = await getProductById(productId);

  return (
    <ProductCreateEditForm
      colors={colors}
      sizes={sizes}
      categories={categories}
      subcategories={subcategories}
      collections={collections}
      existingProduct={product}
      isEditing={true}
    />
  );
}
