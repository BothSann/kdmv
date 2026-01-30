import NotFound from "@/components/NotFound";
import EmptyState from "@/components/EmptyState";
import ProductList from "@/components/product/ProductList";
import CustomerPagination from "@/components/product/CustomerPagination";
import SortSelect from "@/components/ui/sort-select";
import {
  getCollectionBySlug,
  getCollectionProducts,
} from "@/lib/data/collections";
import CollectionBanner from "@/components/collection/CollectionBanner";
import {
  PRODUCT_SORT_OPTIONS,
  DEFAULT_PRODUCT_SORT,
} from "@/lib/constants";

// METADATA (SEO)
export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  // Fetch collection metadata only (optimized)
  const { collection, error } = await getCollectionBySlug(
    resolvedParams.collectionSlug
  );

  if (error || !collection) {
    return {
      title: "Collection Not Found",
    };
  }

  return {
    title: `${collection.name}${currentPage > 1 ? ` - Page ${currentPage}` : ""
      } | KDMV`,
    description:
      collection.description || `Browse ${collection.name} collection products`,
  };
}

export default async function CollectionPage({ params, searchParams }) {
  // 1. Extract parameters
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const collectionSlug = resolvedParams.collectionSlug;
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const currentSort = resolvedSearchParams?.sort || DEFAULT_PRODUCT_SORT;

  // 2. Fetch paginated products for this collection
  const { products, pagination, error } = await getCollectionProducts(
    collectionSlug,
    {
      page: currentPage,
      perPage: 20,
      sortBy: currentSort,
    }
  );

  // 3. Error handling - Collection not found
  if (error) {
    return <NotFound href="/collections" title="Collection" />;
  }

  // 4. Empty state - Collection exists but no products
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No products in this collection"
        description="This collection doesn't have any products yet. Check back soon!"
        className="min-h-[calc(100dvh-10rem)]"
        action={{
          href: "/collections",
          label: "Browse Collections",
        }}
      />
    );
  }

  // 5. Render collection page with products
  return (
    <div className="space-y-16">
      <section className="space-y-4">
        {products[0].collection_banner_image_url && (
          <CollectionBanner
            imageUrl={products[0].collection_banner_image_url}
            name={products[0].collection_name}
          />
        )}
      </section>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-4xl lg:text-5xl leading-none font-bold">
            {products[0].collection_name}
          </h2>
          <SortSelect
            options={PRODUCT_SORT_OPTIONS}
            defaultValue={DEFAULT_PRODUCT_SORT}
          />
        </div>
        {products[0].collection_description && (
          <p className="text-lg text-muted-foreground">
            {products[0].collection_description}
          </p>
        )}
        <p>
          Showing {products.length} of {pagination.count} products
        </p>
      </div>

      {/* Product Grid */}
      <ProductList products={products} variant="grid" />

      {/* Pagination - Only show if more than 1 page */}
      {pagination.totalPages > 1 && (
        <CustomerPagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          basePath={`/collections/${products[0].collection_slug}`}
          currentSort={currentSort}
        />
      )}
    </div>
  );
}
