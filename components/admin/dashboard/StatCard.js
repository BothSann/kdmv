/**
 * StatCard Component
 *
 * Displays a key performance metric with optional trend indicator.
 * Used in dashboard overview section to show stats like revenue, orders, etc.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

/**
 * Format a value based on specified format type
 *
 * @param {number} val - The value to format
 * @param {string} format - Format type: 'currency', 'number', 'percentage'
 * @returns {string} Formatted value
 */
function formatValue(val, format) {
  if (val === null || val === undefined) return "N/A";

  switch (format) {
    case "currency":
      return `$${val.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    case "percentage":
      return `${val.toFixed(1)}%`;

    case "number":
    default:
      return val.toLocaleString("en-US");
  }
}

/**
 * StatCard Component
 *
 * @param {Object} props
 * @param {string} props.title - Card title (e.g., "Total Revenue")
 * @param {number} props.value - Main value to display
 * @param {React.Component} props.icon - Lucide icon component (optional)
 * @param {string} props.trend - Trend direction: 'up', 'down', or null (optional)
 * @param {number} props.trendValue - Trend percentage value (optional)
 * @param {string} props.format - Value format: 'currency', 'number', 'percentage' (default: 'number')
 * @param {string} props.description - Additional description text (optional)
 *
 * @example
 * <StatCard
 *   title="Total Revenue"
 *   value={25000}
 *   icon={DollarSign}
 *   format="currency"
 *   trend="up"
 *   trendValue={12.5}
 * />
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  format = "number",
  description,
}) {
  const isPositiveTrend = trend === "up";
  const hasTrend = trend && trendValue !== undefined && trendValue !== null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {Icon && <Icon className="size-6 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatValue(value, format)}</div>

        {/* Trend Indicator */}
        {hasTrend && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            {isPositiveTrend ? (
              <ArrowUpIcon className="size-3 text-success" />
            ) : (
              <ArrowDownIcon className="size-3 text-destructive" />
            )}
            <span
              className={isPositiveTrend ? "text-success" : "text-destructive"}
            >
              {Math.abs(trendValue).toFixed(1)}%
            </span>
            <span>from last period</span>
          </p>
        )}

        {/* Optional Description */}
        {description && !hasTrend && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
