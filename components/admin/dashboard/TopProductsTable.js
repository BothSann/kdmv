/**
 * TopProductsTable Component
 *
 * Displays best-selling products in a table format.
 * Shows product name, quantity sold, and total revenue.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

/**
 * TopProductsTable Component
 *
 * @param {Object} props
 * @param {Array} props.products - Array of top selling products
 *   Format: [{ product_name: 'Product A', total_quantity: 10, total_revenue: 500 }, ...]
 * @param {number} props.limit - Number of products to display (optional, for display only)
 *
 * @example
 * <TopProductsTable
 *   products={[
 *     { product_name: 'Premium Cologne', total_quantity: 25, total_revenue: 1250 },
 *     { product_name: 'Luxury Perfume', total_quantity: 15, total_revenue: 900 },
 *   ]}
 * />
 */
export function TopProductsTable({ products }) {
  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mb-2" />
            <p>No sales data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {products.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.total_quantity}{" "}
                  {product.total_quantity === 1 ? "unit" : "units"} sold
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <p className="font-bold text-right">
                  ${product.total_revenue.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default TopProductsTable;
