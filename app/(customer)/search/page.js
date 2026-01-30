import { searchProducts } from "@/lib/data/products";
import ProductList from "@/components/product/ProductList";
import CustomerPagination from "@/components/product/CustomerPagination";
import EmptyState from "@/components/EmptyState";
import { Search, SearchX } from "lucide-react";

// Dynamic metadata based on search query
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = params.q || "";

  return {
    title: query ? `Search: ${query} | KDMV` : "Search Products | KDMV",
    description: query
      ? `Search results for ${query}`
      : "Search for products in our store",
  };
}

export default async function SearchPage({ searchParams }) {
  // Extract and await searchParams (Next.js 15 pattern)
  const params = await searchParams;
  const query = params.q || "";
  const currentPage = Math.max(1, Number(params.page) || 1);

  // If no query provided, show empty state
  if (!query.trim()) {
    return (
      <EmptyState
        icon={Search}
        title="Start your search"
        description="Enter a search term to find products"
      />
    );
  }

  // Fetch search results
  const { products, pagination, error } = await searchProducts({
    query,
    page: currentPage,
    perPage: 20,
  });

  // Handle errors
  if (error) {
    return (
      <EmptyState
        title="Search failed"
        description="Something went wrong while searching. Please try again."
      />
    );
  }

  // No results found
  if (!products || products.length === 0) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">
            Results for &quot;{query}&quot;
          </h1>
          <p className="text-muted-foreground">0 products found</p>
        </div>

        <EmptyState
          className="min-h-[calc(100dvh-10rem)]"
          icon={SearchX}
          title="No products found"
          description={`We couldn't find any products matching "${query}". Try different keywords.`}
        />
      </div>
    );
  }

  // Display results
  return (
    <div className="space-y-16">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-5xl font-bold">Results for &quot;{query}&quot;</h1>
        <p className="text-lg text-muted-foreground">
          Showing {products.length} of {pagination.count} products
        </p>
      </div>

      {/* Product Grid */}
      <ProductList products={products} variant="grid" />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <CustomerPagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
        />
      )}
    </div>
  );
}
