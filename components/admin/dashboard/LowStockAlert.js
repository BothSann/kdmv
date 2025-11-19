/**
 * LowStockAlert Component
 *
 * Displays inventory alerts for products with low stock.
 * Highlighted with warning colors to draw attention.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * LowStockAlert Component
 *
 * @param {Object} props
 * @param {Array} props.items - Array of low stock items
 *   Format: [{ product_name: 'Product A', sku: 'SKU-123', color: 'Red', size: 'M', quantity: 2 }, ...]
 * @param {number} props.threshold - Stock threshold that triggered the alert (optional, for display)
 *
 * @example
 * <LowStockAlert
 *   items={[
 *     { product_name: 'Premium Cologne', sku: 'PC-BL-M', color: 'Blue', size: 'M', quantity: 3 },
 *   ]}
 *   threshold={10}
 * />
 */
export function LowStockAlert({ items, threshold = 10 }) {
  if (!items || items.length === 0) {
    return null; // Don't show card if no alerts
  }

  return (
    <Card className="border-warning-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-warning" />
          <CardTitle className="text-warning">Low Stock Alert</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length} {items.length === 1 ? "product" : "products"} below{" "}
          {threshold} units
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-warning-bg border border-warning-border"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {item.product_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.color} / {item.size} &mdash; SKU: {item.sku}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`ml-3 ${
                  item.quantity === 0
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-warning bg-warning/10 text-warning"
                }`}
              >
                {item.quantity === 0 ? "Out of Stock" : `${item.quantity} left`}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default LowStockAlert;
