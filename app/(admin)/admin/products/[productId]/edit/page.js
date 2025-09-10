import {
  getAllColors,
  getAllSizes,
  getAllCategories,
  getAllSubcategories,
  getProductById,
} from "@/lib/apiProducts";
import ProductCreateEditForm from "@/components/ProductCreateEditForm";

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

  // Fetch the product for editing
  const { product } = await getProductById(productId);

  return (
    <ProductCreateEditForm
      colors={colors}
      sizes={sizes}
      categories={categories}
      subcategories={subcategories}
      existingProduct={product}
      isEditing={true}
    />
  );
}
