import CollectionItem from "@/components/collection/CollectionItem";
import CollectionList from "@/components/collection/CollectionList";
import { getAllCollections } from "@/lib/api/collections";

// METADATA (SEO)
export const metadata = {
  title: "KDMV | All Collections",
  description: "Browse all collections available in the store",
};

export default async function CollectionsPage() {
  const { collections, pagination } = await getAllCollections({ perPage: 100 });

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-5xl font-bold">All Collections</h2>
        <p>
          Showing {collections.length} of {pagination.count} collections
        </p>
      </div>
      <CollectionList collections={collections} />
    </div>
  );
}
