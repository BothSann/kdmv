import CollectionItem from "@/components/collection/CollectionItem";
import CollectionList from "@/components/collection/CollectionList";
import EmptyState from "@/components/EmptyState";
import NotFound from "@/components/NotFound";
import CustomerPagination from "@/components/product/CustomerPagination";
import { getAllCollections } from "@/lib/data/collections";

// METADATA (SEO)
export const metadata = {
  title: "KDMV | All Collections",
  description: "Browse all collections available in the store",
};

export default async function CollectionsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const { collections, pagination, error } = await getAllCollections({
    page: currentPage,
    perPage: 10,
  });

  if (error) {
    return <NotFound href="/collections" title="Collection" />;
  }

  if (!collections || collections.length === 0) {
    return (
      <EmptyState
        title="No collections found"
        description="No collections found in the database"
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-5xl font-bold">All Collections</h2>
        <p>
          Showing {collections.length} of {pagination.count} collections
        </p>
      </div>

      <CollectionList collections={collections} />

      {pagination.totalPages > 1 && (
        <CustomerPagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          basePath="/collections"
        />
      )}
    </div>
  );
}
