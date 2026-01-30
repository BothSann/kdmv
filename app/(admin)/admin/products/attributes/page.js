import {
  getAllProductTypesAdmin,
  getAllGendersAdmin,
} from "@/lib/data/product-attributes";
import ProductAttributesClient from "@/components/product/ProductAttributesClient";

export const metadata = {
  title: "Product Attributes | Admin",
};

export default async function AdminProductAttributesPage() {
  const [productTypesResult, gendersResult] = await Promise.all([
    getAllProductTypesAdmin(),
    getAllGendersAdmin(),
  ]);

  return (
    <ProductAttributesClient
      productTypes={productTypesResult.productTypes || []}
      genders={gendersResult.genders || []}
    />
  );
}
