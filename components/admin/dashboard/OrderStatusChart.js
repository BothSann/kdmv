"use client";

/**
 * OrderStatusChart Component
 *
 * Displays order status distribution using a pie/donut chart.
 * Shows proportion of orders in each status (PENDING, CONFIRMED, SHIPPED, etc.)
 */

import {
  Pie,
  PieChart,
  Cell,
  Legend,
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

/**
 * Custom Tooltip for the pie chart
 */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border border-border bg-background py-2 px-4 shadow-sm">
        <div className="flex flex-col space-y-0.5">
          <span className="text-xs uppercase text-muted-foreground">
            {data.name}
          </span>
          <span className="font-semibold text-muted-foreground text-sm">
            {data.value} {data.value === 1 ? "order" : "orders"}
          </span>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Custom Label for pie chart slices
 */
function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label if slice is too small

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/**
 * OrderStatusChart Component
 *
 * @param {Object} props
 * @param {Array} props.data - Array of order status data
 *   Format: [{ status: 'PENDING', count: 5, fill: 'hsl(...)' }, ...]
 * @param {string} props.title - Chart title (default: 'Order Status Distribution')
 * @param {string} props.description - Chart description (optional)
 *
 * @example
 * <OrderStatusChart
 *   data={[
 *     { status: 'PENDING', count: 5, fill: 'hsl(var(--chart-1))' },
 *     { status: 'DELIVERED', count: 12, fill: 'hsl(var(--chart-4))' },
 *   ]}
 * />
 */
export function OrderStatusChart({
  data,
  title = "Order Status Distribution",
  description = "Overview of order statuses",
}) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No order data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for Recharts (uses 'name' and 'value' keys)
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    fill: item.fill,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={90}
              outerRadius={120}
              paddingAngle={3}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="middle"
              align="right"
              width="40%"
              layout="vertical"
              height={36}
              iconType="circle"
              iconSize={10}
              formatter={(value) => (
                <span className="ml-2 text-sm text-muted-foreground">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default OrderStatusChart;
