import CollectionCreateEditForm from "@/components/collection/CollectionCreateEditForm";
import CollectionProductSelector from "@/components/collection/CollectionProductSelector";
import { getAllProducts } from "@/lib/api/server/products";

export default async function AdminCreateCollectionPage() {
  const { products } = await getAllProducts({ perPage: 100 });

  return (
    <CollectionCreateEditForm>
      <CollectionProductSelector products={products} existingProductIds={[]} />
    </CollectionCreateEditForm>
  );
}
