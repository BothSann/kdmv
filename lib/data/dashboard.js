/**
 * Dashboard API Functions
 *
 * This module provides API functions for retrieving analytics data
 * for the admin dashboard. All functions use supabaseAdmin for elevated
 * permissions and work with UTC date ranges.
 */

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { format, parseISO, eachDayOfInterval } from "date-fns";

/**
 * Get overview statistics for the dashboard
 *
 * Fetches key metrics including revenue, orders, customers, and growth rates.
 * Compares current period with previous period to calculate trends.
 *
 * @param {string} startDate - ISO date string (UTC) for period start
 * @param {string} endDate - ISO date string (UTC) for period end
 * @returns {Object} Dashboard statistics or error
 *
 * @example
 * const { stats } = await getDashboardStats(
 *   '2024-11-11T00:00:00.000Z',
 *   '2024-11-18T23:59:59.999Z'
 * );
 * // Returns: { totalRevenue, totalOrders, avgOrderValue, revenueGrowth, ... }
 */
export async function getDashboardStats(startDate, endDate) {
  try {
    // Query 1: Revenue and order count (PAID orders only)
    const { data: orderStats, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("total_amount, created_at")
      .eq("payment_status", "PAID")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (orderError) throw orderError;

    // Query 2: Previous period for comparison
    const periodDays = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    const prevStartDate = new Date(
      new Date(startDate).getTime() - periodDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: prevOrderStats, error: prevError } = await supabaseAdmin
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "PAID")
      .gte("created_at", prevStartDate)
      .lt("created_at", startDate);

    if (prevError) throw prevError;

    // Query 3: New customers in period
    const { count: newCustomersCount, error: customersError } =
      await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate)
        .lte("created_at", endDate);

    if (customersError) throw customersError;

    // Query 4: Active customers (made at least one order)
    const { data: activeCustomers, error: activeError } = await supabaseAdmin
      .from("orders")
      .select("customer_id")
      .eq("payment_status", "PAID")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (activeError) throw activeError;

    // Calculate metrics
    const totalRevenue = orderStats.reduce(
      (sum, order) => sum + parseFloat(order.total_amount),
      0
    );
    const totalOrders = orderStats.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const prevRevenue = prevOrderStats.reduce(
      (sum, order) => sum + parseFloat(order.total_amount),
      0
    );
    const revenueGrowth =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const prevOrders = prevOrderStats.length;
    const ordersGrowth =
      prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;

    const uniqueActiveCustomers = new Set(
      activeCustomers.map((o) => o.customer_id)
    ).size;

    return {
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        revenueGrowth,
        ordersGrowth,
        newCustomers: newCustomersCount || 0,
        activeCustomers: uniqueActiveCustomers,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { error: "Failed to fetch dashboard statistics" };
  }
}

/**
 * Get revenue over time (for line/area chart)
 *
 * Retrieves daily revenue data for the specified period.
 * Fills in missing dates with 0 revenue to ensure continuous chart data.
 *
 * @param {string} startDate - ISO date string (UTC) for period start
 * @param {string} endDate - ISO date string (UTC) for period end
 * @param {string} granularity - Time granularity ('day', 'week', 'month') - currently only 'day' is implemented
 * @returns {Object} Array of { date, revenue } objects or error
 *
 * @example
 * const { data } = await getRevenueOverTime(
 *   '2024-11-11T00:00:00.000Z',
 *   '2024-11-18T23:59:59.999Z'
 * );
 * // Returns: [{ date: 'Nov 11', revenue: 150 }, { date: 'Nov 12', revenue: 0 }, ...]
 */
export async function getRevenueOverTime(
  startDate,
  endDate,
  granularity = "day"
) {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("total_amount, created_at")
      .eq("payment_status", "PAID")
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Group by date
    const revenueByDate = {};

    orders.forEach((order) => {
      const date = format(parseISO(order.created_at), "yyyy-MM-dd");
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      revenueByDate[date] += parseFloat(order.total_amount);
    });

    // Fill in missing dates with 0
    const dateRange = eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate),
    });

    const chartData = dateRange.map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      return {
        date: format(date, "MMM d"), // "Nov 1"
        revenue: revenueByDate[dateKey] || 0,
      };
    });

    return { success: true, data: chartData };
  } catch (error) {
    console.error("Error fetching revenue over time:", error);
    return { error: "Failed to fetch revenue data" };
  }
}

/**
 * Get order status distribution (for pie/donut chart)
 *
 * Retrieves count of orders grouped by status.
 * Includes color mapping for consistent chart visualization.
 *
 * @param {string} startDate - ISO date string (UTC) for period start
 * @param {string} endDate - ISO date string (UTC) for period end
 * @returns {Object} Array of { status, count, fill } objects or error
 *
 * @example
 * const { data } = await getOrderStatusDistribution(
 *   '2024-11-11T00:00:00.000Z',
 *   '2024-11-18T23:59:59.999Z'
 * );
 * // Returns: [
 * //   { status: 'PENDING', count: 5, fill: 'hsl(var(--chart-1))' },
 * //   { status: 'DELIVERED', count: 12, fill: 'hsl(var(--chart-4))' }
 * // ]
 */
export async function getOrderStatusDistribution(startDate, endDate) {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("status")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) throw error;

    // Count by status
    const statusCounts = {};
    orders.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    // Transform to chart format with colors
    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      fill: getStatusColor(status),
    }));

    return { success: true, data: chartData };
  } catch (error) {
    console.error("Error fetching order status distribution:", error);
    return { error: "Failed to fetch order status data" };
  }
}

/**
 * Get payment status distribution (for pie/donut chart)
 *
 * Retrieves count of orders grouped by payment status.
 *
 * @param {string} startDate - ISO date string (UTC) for period start
 * @param {string} endDate - ISO date string (UTC) for period end
 * @returns {Object} Array of { paymentStatus, count, fill } objects or error
 */
export async function getPaymentStatusDistribution(startDate, endDate) {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("payment_status")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) throw error;

    // Count by payment status
    const paymentCounts = {};
    orders.forEach((order) => {
      paymentCounts[order.payment_status] =
        (paymentCounts[order.payment_status] || 0) + 1;
    });

    // Transform to chart format
    const chartData = Object.entries(paymentCounts).map(
      ([paymentStatus, count]) => ({
        paymentStatus,
        count,
        fill: getPaymentStatusColor(paymentStatus),
      })
    );

    return { success: true, data: chartData };
  } catch (error) {
    console.error("Error fetching payment status distribution:", error);
    return { error: "Failed to fetch payment status data" };
  }
}

/**
 * Get top selling products (for horizontal bar chart or table)
 *
 * Retrieves products sorted by total revenue.
 * Only includes PAID orders.
 *
 * @param {string} startDate - ISO date string (UTC) for period start
 * @param {string} endDate - ISO date string (UTC) for period end
 * @param {number} limit - Maximum number of products to return (default: 5)
 * @returns {Object} Array of product stats or error
 *
 * @example
 * const { data } = await getTopSellingProducts(
 *   '2024-11-11T00:00:00.000Z',
 *   '2024-11-18T23:59:59.999Z',
 *   5
 * );
 * // Returns: [
 * //   { product_name: 'Premium Cologne', total_quantity: 25, total_revenue: 1250 },
 * //   ...
 * // ]
 */
export async function getTopSellingProducts(startDate, endDate, limit = 5) {
  try {
    const { data: orderItems, error } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        product_id,
        product_name,
        quantity,
        total_price,
        orders!inner(
          created_at,
          payment_status
        )
      `
      )
      .eq("orders.payment_status", "PAID")
      .gte("orders.created_at", startDate)
      .lte("orders.created_at", endDate);

    if (error) throw error;

    // Aggregate by product
    const productStats = {};

    orderItems.forEach((item) => {
      const productId = item.product_id;
      if (!productStats[productId]) {
        productStats[productId] = {
          product_name: item.product_name,
          total_quantity: 0,
          total_revenue: 0,
        };
      }
      productStats[productId].total_quantity += item.quantity;
      productStats[productId].total_revenue += parseFloat(item.total_price);
    });

    // Sort by revenue and take top N
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, limit);

    return { success: true, data: topProducts };
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return { error: "Failed to fetch top selling products" };
  }
}

/**
 * Get low stock products (for alerts)
 *
 * Retrieves product variants with inventory below specified threshold.
 * Only includes active products.
 *
 * @param {number} threshold - Stock quantity threshold (default: 10)
 * @returns {Object} Array of low stock items or error
 *
 * @example
 * const { data } = await getLowStockProducts(10);
 * // Returns: [
 * //   { product_name: 'Premium Cologne', sku: 'PC-BL-M', quantity: 5, ... },
 * //   ...
 * // ]
 */
export async function getLowStockProducts(threshold = 10) {
  try {
    const { data: variants, error } = await supabaseAdmin
      .from("product_variants")
      .select(
        `
        id,
        sku,
        quantity,
        products!inner(
          id,
          name,
          product_code,
          is_active
        ),
        colors(name),
        sizes(name)
      `
      )
      .eq("products.is_active", true)
      .lte("quantity", threshold)
      .order("quantity", { ascending: true });

    if (error) throw error;

    const lowStockItems = variants.map((v) => ({
      product_id: v.products.id,
      product_name: v.products.name,
      product_code: v.products.product_code,
      sku: v.sku,
      color: v.colors?.name || "N/A",
      size: v.sizes?.name || "N/A",
      quantity: v.quantity,
    }));

    return { success: true, data: lowStockItems };
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    return { error: "Failed to fetch low stock products" };
  }
}

/**
 * Get total products count
 *
 * @returns {Object} Product count or error
 */
export async function getTotalProductsCount() {
  try {
    const { count, error } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .is("deleted_at", null);

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Error fetching total products count:", error);
    return { error: "Failed to fetch products count" };
  }
}

/**
 * Get total customers count
 *
 * @returns {Object} Customer count or error
 */
export async function getTotalCustomersCount() {
  try {
    const { count, error } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer");

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Error fetching total customers count:", error);
    return { error: "Failed to fetch customers count" };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color for order status
 *
 * Maps order status to chart color variable.
 * Uses CSS variables defined in globals.css.
 *
 * @param {string} status - Order status
 * @returns {string} CSS color variable
 */
function getStatusColor(status) {
  const colors = {
    PENDING: "var(--chart-1)",
    CONFIRMED: "var(--chart-2)",
    SHIPPED: "var(--chart-3)",
    DELIVERED: "var(--chart-4)",
    CANCELLED: "var(--chart-5)",
  };
  return colors[status] || "var(--chart-1)";
}

/**
 * Get color for payment status
 *
 * @param {string} paymentStatus - Payment status
 * @returns {string} CSS color variable
 */
function getPaymentStatusColor(paymentStatus) {
  const colors = {
    PENDING: "var(--chart-1)",
    PAID: "var(--chart-4)",
    FAILED: "var(--chart-5)",
    REFUNDED: "var(--chart-3)",
  };
  return colors[paymentStatus] || "var(--chart-1)";
}
