import EmptyState from "@/components/EmptyState";
import NotFound from "@/components/NotFound";
import Pagination from "@/components/Pagination";
import CustomerPagination from "@/components/product/CustomerPagination";
import ProductList from "@/components/product/ProductList";
import { getAllProducts } from "@/lib/api/products";

// METADATA (SEO)
export const metadata = {
  title: "KDMV | All Products",
  description: "Browse all products available in the store",
};

export default async function AllProductsPage({ searchParams }) {
  // Get current page from URL
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, Number(resolvedParams?.page) || 1);

  // Fetch products from database
  const { products, pagination, error } = await getAllProducts({
    page: currentPage,
    perPage: 20,
  });

  if (error) {
    return <NotFound href="/products" title="Product" />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="No products found in the database"
      />
    );
  }

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <h2 className="text-5xl font-bold">All Products</h2>
        <p>
          Showing {products.length} of {pagination.count} products
        </p>
      </div>

      <ProductList products={products} variant="grid" />

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
