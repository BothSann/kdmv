import NotFound from "@/components/NotFound";
import EmptyState from "@/components/EmptyState";
import ProductList from "@/components/product/ProductList";
import CustomerPagination from "@/components/product/CustomerPagination";
import {
  getCollectionBySlug,
  getCollectionProducts,
} from "@/lib/api/collections";
import Image from "next/image";

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
    title: `${collection.name}${
      currentPage > 1 ? ` - Page ${currentPage}` : ""
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

  // 2. Fetch paginated products for this collection
  const { products, pagination, error } = await getCollectionProducts(
    collectionSlug,
    {
      page: currentPage,
      perPage: 20,
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
          <div className="relative aspect-[16/12] lg:aspect-[16/7] group overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 z-10" />
            <Image
              src={products[0].collection_banner_image_url}
              alt={products[0].collection_name}
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 z-20 w-full p-3 lg:p-5">
              <p className="text-white/95 font-bold text-xl lg:text-4xl relative inline-block leading-tight">
                {products[0].collection_name}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold">{products[0].collection_name}</h1>
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
        />
      )}
    </div>
  );
}
