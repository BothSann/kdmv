/**
 * Admin Dashboard Page
 *
 * Main dashboard for admin users displaying:
 * - Key metrics (Revenue, Orders, AOV, Customers)
 * - Revenue trends over time
 * - Order and payment status distribution
 * - Top selling products
 * - Low stock alerts
 *
 * Server Component - fetches data on server for optimal performance
 */

import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { getDashboardDataAction } from "@/server/actions/dashboard-action";
import {
  StatCard,
  RevenueChart,
  OrderStatusChart,
  PaymentStatusChart,
  DashboardFilter,
  TopProductsTable,
  LowStockAlert,
} from "@/components/admin/dashboard";

export default async function AdminDashboardPage({ searchParams }) {
  // Get filter from URL params (default: last7days)
  const params = await searchParams;
  const filter = params?.period || "last7days";

  // Fetch dashboard data
  const result = await getDashboardDataAction(filter);

  // Handle error state
  if (result.error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <DashboardFilter />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive mb-2">
              Failed to load dashboard data
            </p>
            <p className="text-sm text-muted-foreground">{result.error}</p>
            {result.details && (
              <p className="text-xs text-muted-foreground mt-2">
                {result.details}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Destructure data
  const {
    stats,
    revenueChart,
    orderStatusChart,
    paymentStatusChart,
    topProducts,
    lowStockProducts,
    totalProducts,
    totalCustomers,
  } = result.data;

  return (
    <div className="space-y-8">
      {/* Header with Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <DashboardFilter defaultValue={filter} />
      </div>

      {/* Stats Grid - 4 Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          format="currency"
          trend={stats.revenueGrowth >= 0 ? "up" : "down"}
          trendValue={stats.revenueGrowth}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          format="number"
          trend={stats.ordersGrowth >= 0 ? "up" : "down"}
          trendValue={stats.ordersGrowth}
        />
        <StatCard
          title="Average Order Value"
          value={stats.avgOrderValue}
          icon={TrendingUp}
          format="currency"
          description="Per order"
        />
        <StatCard
          title="Active Customers"
          value={stats.activeCustomers}
          icon={Users}
          format="number"
          description={`${stats.newCustomers} new this period`}
        />
      </div>

      {/* Charts Grid - Revenue & Status Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart
          data={revenueChart}
          title="Revenue Over Time"
          description={`Daily revenue trends`}
        />
        <OrderStatusChart
          data={orderStatusChart}
          title="Order Status Distribution"
          description="Current order statuses"
        />
      </div>

      {/* Payment Status Chart (Optional - can be in grid above or separate) */}
      {paymentStatusChart && paymentStatusChart.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <PaymentStatusChart
            data={paymentStatusChart}
            title="Payment Status Distribution"
            description="Payment completion rates"
          />
          <div className="flex flex-col gap-4">
            {/* Additional Stats Cards or Info */}
            <StatCard
              title="Total Products"
              value={totalProducts}
              format="number"
              description="Active products in catalog"
            />
            <StatCard
              title="Total Customers"
              value={totalCustomers}
              format="number"
              description="Registered customers"
            />
          </div>
        </div>
      )}

      {/* Top Selling Products */}
      <TopProductsTable products={topProducts} />

      {/* Low Stock Alerts - Only shows if there are alerts */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <LowStockAlert items={lowStockProducts} threshold={10} />
      )}
    </div>
  );
}
