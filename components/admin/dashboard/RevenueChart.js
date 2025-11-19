"use client";

/**
 * RevenueChart Component
 *
 * Displays revenue data over time using an area chart.
 * Shows daily revenue with smooth curves and interactive tooltips.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

/**
 * Custom Tooltip for the chart
 */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-background py-2 px-4 shadow-sm">
        <div className="flex flex-col space-y-0.5">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {label}
          </span>
          <span className="font-semibold text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </span>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * RevenueChart Component
 *
 * @param {Object} props
 * @param {Array} props.data - Array of revenue data points
 *   Format: [{ date: 'Nov 15', revenue: 150 }, ...]
 * @param {string} props.title - Chart title (default: 'Revenue Over Time')
 * @param {string} props.description - Chart description (optional)
 *
 * @example
 * <RevenueChart
 *   data={[
 *     { date: 'Nov 15', revenue: 150 },
 *     { date: 'Nov 16', revenue: 200 },
 *   ]}
 *   title="Daily Revenue"
 *   description="Revenue for the last 7 days"
 * />
 */
export function RevenueChart({
  data,
  title = "Revenue Over Time",
  description = "Daily revenue for the selected period",
}) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No revenue data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.3}
                />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              strokeWidth={1}
              fillOpacity={1}
              fill="var(--chart-3)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default RevenueChart;
