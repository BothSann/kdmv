import { getCollectionById } from "@/lib/apiCollections";
import { getAllProducts } from "@/lib/apiProducts";
import NotFound from "@/components/NotFound";
import CollectionCreateEditForm from "@/components/collection/CollectionCreateEditForm";
import CollectionProductSelector from "@/components/collection/CollectionProductSelector";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { collection, error } = await getCollectionById(
    resolvedParams.collectionId
  );

  if (error || !collection) {
    return {
      title: "Edit Collection - Not Found",
    };
  }

  return {
    title: `Edit ${collection.name}`,
  };
}

export default async function AdminEditCollectionPage({ params }) {
  const resolvedParams = await params;

  // Fetch collection and all available products
  const [collectionResult, productsResult] = await Promise.all([
    getCollectionById(resolvedParams.collectionId),
    getAllProducts({ perPage: 100 }), // Get all products for selection
  ]);

  if (collectionResult.error || !collectionResult.collection) {
    return <NotFound href="/admin/collections" title="Collection" />;
  }

  if (productsResult.error || !productsResult.products) {
    return <NotFound href="/admin/collections" title="Products unavailable" />;
  }

  const { collection } = collectionResult;
  const { products } = productsResult;

  // Extract existing product IDs for pre-selection
  const existingProductIds = collection.products?.map((p) => p.id) || [];

  return (
    <CollectionCreateEditForm existingCollection={collection}>
      <CollectionProductSelector
        products={products}
        existingProductIds={existingProductIds}
      />
    </CollectionCreateEditForm>
  );
}
