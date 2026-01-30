import EmptyState from "@/components/EmptyState";
import NotFound from "@/components/NotFound";
import CustomerPagination from "@/components/product/CustomerPagination";
import ProductList from "@/components/product/ProductList";
import ProductFilters from "@/components/product/ProductFilters";
import SortSelect from "@/components/ui/sort-select";
import { getAllProducts, getAllProductTypes } from "@/lib/data/products";
import {
  PRODUCT_SORT_OPTIONS,
  DEFAULT_PRODUCT_SORT,
} from "@/lib/constants";

// METADATA (SEO)
export const metadata = {
  title: "KDMV | All Products",
  description: "Browse all products available in the store",
};

export default async function AllProductsPage({ searchParams }) {
  // Get current page, sort, and filters from URL
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, Number(resolvedParams?.page) || 1);
  const currentSort = resolvedParams?.sort || DEFAULT_PRODUCT_SORT;
  const productTypeId = resolvedParams?.type || null;
  const gender = resolvedParams?.gender || null;

  // Fetch products and product types
  const [productsResult, productTypesResult] = await Promise.all([
    getAllProducts({
      page: currentPage,
      perPage: 20,
      sortBy: currentSort,
      productTypeId,
      gender,
    }),
    getAllProductTypes(),
  ]);

  const { products, pagination, error } = productsResult;
  const { productTypes } = productTypesResult;

  if (error) {
    return <NotFound href="/products" title="Product" />;
  }

  // Build page title based on filters
  const getPageTitle = () => {
    const parts = [];
    if (gender) {
      parts.push(gender.charAt(0).toUpperCase() + gender.slice(1) + "'s");
    }
    if (productTypeId) {
      const productType = productTypes?.find((pt) => pt.id === productTypeId);
      if (productType) parts.push(productType.name);
    }
    if (parts.length === 0) return "All Products";
    return parts.join(" ");
  };

  const hasActiveFilters = productTypeId || gender;

  if (!products || products.length === 0) {
    return (
      <div className="space-y-8">
        <ProductFilters
          productTypes={productTypes || []}
          currentProductTypeId={productTypeId}
          currentGender={gender}
        />
        <EmptyState
          title="No products found"
          description={
            hasActiveFilters
              ? "Try adjusting your filters to find what you're looking for"
              : "No products found in the database"
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <ProductFilters
        productTypes={productTypes || []}
        currentProductTypeId={productTypeId}
        currentGender={gender}
      />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-5xl font-bold">{getPageTitle()}</h2>
          <SortSelect
            options={PRODUCT_SORT_OPTIONS}
            defaultValue={DEFAULT_PRODUCT_SORT}
          />
        </div>
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
          currentSort={currentSort}
          extraParams={{ type: productTypeId, gender }}
        />
      )}
    </div>
  );
}
