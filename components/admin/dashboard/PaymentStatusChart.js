"use client";

/**
 * PaymentStatusChart Component
 *
 * Displays payment status distribution using a pie/donut chart.
 * Shows proportion of payments in each status (PAID, PENDING, FAILED, REFUNDED)
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
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-xs uppercase text-muted-foreground">
              {data.name}
            </span>
            <span className="font-semibold text-muted-foreground text-sm">
              {data.value} {data.value === 1 ? "payment" : "payments"}
            </span>
          </div>
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
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
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
 * PaymentStatusChart Component
 *
 * @param {Object} props
 * @param {Array} props.data - Array of payment status data
 *   Format: [{ paymentStatus: 'PAID', count: 10, fill: 'hsl(...)' }, ...]
 * @param {string} props.title - Chart title (default: 'Payment Status Distribution')
 * @param {string} props.description - Chart description (optional)
 *
 * @example
 * <PaymentStatusChart
 *   data={[
 *     { paymentStatus: 'PAID', count: 10, fill: 'hsl(var(--chart-4))' },
 *     { paymentStatus: 'PENDING', count: 2, fill: 'hsl(var(--chart-1))' },
 *   ]}
 * />
 */
export function PaymentStatusChart({
  data,
  title = "Payment Status Distribution",
  description = "Overview of payment statuses",
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
            No payment data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for Recharts (uses 'name' and 'value' keys)
  const chartData = data.map((item) => ({
    name: item.paymentStatus,
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
              outerRadius={80}
              label={renderCustomLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default PaymentStatusChart;
