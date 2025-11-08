import CollectionCreateEditForm from "@/components/collection/CollectionCreateEditForm";
import CollectionProductSelector from "@/components/collection/CollectionProductSelector";
import { getAllProducts } from "@/lib/api/products";

export default async function AdminCreateCollectionPage() {
  const { products } = await getAllProducts();

  return (
    <CollectionCreateEditForm>
      <CollectionProductSelector products={products} existingProductIds={[]} />
    </CollectionCreateEditForm>
  );
}
