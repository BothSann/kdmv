"use server";

/**
 * Dashboard Server Actions
 *
 * This module provides server actions for retrieving dashboard analytics data.
 * Server actions are called from client components and pages to fetch data securely.
 *
 * All functions marked with 'use server' run on the server and can access
 * server-side resources like Supabase admin client.
 */

import {
  getDateRangeFromFilter,
  isValidFilter,
} from "@/lib/utils/dateRangeHelper";
import {
  getDashboardStats,
  getRevenueOverTime,
  getOrderStatusDistribution,
  getPaymentStatusDistribution,
  getTopSellingProducts,
  getLowStockProducts,
  getTotalProductsCount,
  getTotalCustomersCount,
} from "@/lib/api/dashboard";

/**
 * Get all dashboard data for the specified filter period
 *
 * This is the main server action for the admin dashboard.
 * It fetches all metrics, charts, and analytics data in a single call.
 *
 * @param {string} filter - Time period filter ('last7days', 'last30days', 'last90days')
 * @returns {Promise<Object>} Dashboard data object or error
 *
 * @example
 * // In a Server Component or Client Component with useTransition:
 * const result = await getDashboardDataAction('last30days');
 * if (result.success) {
 *   const { stats, revenueChart, orderStatusChart } = result.data;
 * }
 */
export async function getDashboardDataAction(filter = "last7days") {
  try {
    // STEP 1: VALIDATE FILTER
    if (!isValidFilter(filter)) {
      console.warn(`Invalid filter "${filter}", defaulting to "last7days"`);
      filter = "last7days";
    }

    // STEP 2: CALCULATE DATE RANGE
    const { startDate, endDate, label, daysCount } =
      getDateRangeFromFilter(filter);

    // console.log(`[Dashboard] Fetching data for ${label} (${daysCount} days)`);
    // console.log(`[Dashboard] Date range: ${startDate} to ${endDate}`);

    // STEP 3: FETCH ALL DATA IN PARALLEL
    // Using Promise.all for optimal performance
    const [
      statsResult,
      revenueResult,
      orderStatusResult,
      paymentStatusResult,
      topProductsResult,
      lowStockResult,
      totalProductsResult,
      totalCustomersResult,
    ] = await Promise.all([
      getDashboardStats(startDate, endDate),
      getRevenueOverTime(startDate, endDate),
      getOrderStatusDistribution(startDate, endDate),
      getPaymentStatusDistribution(startDate, endDate),
      getTopSellingProducts(startDate, endDate, 5),
      getLowStockProducts(10),
      getTotalProductsCount(),
      getTotalCustomersCount(),
    ]);

    // STEP 4: CHECK FOR ERRORS
    // If any critical API call fails, return error
    if (statsResult.error) {
      console.error("[Dashboard] Stats fetch error:", statsResult.error);
      return { error: statsResult.error };
    }

    if (revenueResult.error) {
      console.error("[Dashboard] Revenue fetch error:", revenueResult.error);
      return { error: revenueResult.error };
    }

    if (orderStatusResult.error) {
      console.error(
        "[Dashboard] Order status fetch error:",
        orderStatusResult.error
      );
      return { error: orderStatusResult.error };
    }

    if (topProductsResult.error) {
      console.error(
        "[Dashboard] Top products fetch error:",
        topProductsResult.error
      );
      return { error: topProductsResult.error };
    }

    // Non-critical errors: log but continue
    if (paymentStatusResult.error) {
      console.warn(
        "[Dashboard] Payment status fetch failed:",
        paymentStatusResult.error
      );
    }

    if (lowStockResult.error) {
      console.warn("[Dashboard] Low stock fetch failed:", lowStockResult.error);
    }

    if (totalProductsResult.error) {
      console.warn(
        "[Dashboard] Total products count failed:",
        totalProductsResult.error
      );
    }

    if (totalCustomersResult.error) {
      console.warn(
        "[Dashboard] Total customers count failed:",
        totalCustomersResult.error
      );
    }

    // STEP 5: TRANSFORM AND COMBINE DATA
    const dashboardData = {
      // Overview statistics
      stats: statsResult.stats,

      // Chart data
      revenueChart: revenueResult.data,
      orderStatusChart: orderStatusResult.data,
      paymentStatusChart: paymentStatusResult.data || [],

      // Top products table
      topProducts: topProductsResult.data,

      // Alerts
      lowStockProducts: lowStockResult.data || [],

      // Totals
      totalProducts: totalProductsResult.count || 0,
      totalCustomers: totalCustomersResult.count || 0,

      // Metadata
      filter,
      dateRange: {
        label,
        startDate,
        endDate,
        daysCount,
      },
    };

    // console.log(
    //   `[Dashboard] Successfully fetched data: ${statsResult.stats.totalOrders} orders, $${statsResult.stats.totalRevenue} revenue`
    // );

    // STEP 6: RETURN SUCCESS
    return {
      success: true,
      data: dashboardData,
    };
  } catch (error) {
    console.error("[Dashboard] Unexpected error:", error);
    return {
      error: "Failed to fetch dashboard data. Please try again.",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    };
  }
}

/**
 * Refresh dashboard data
 *
 * This action can be called to force a refresh of dashboard data.
 * Useful for real-time updates or manual refresh functionality.
 *
 * @param {string} filter - Time period filter
 * @returns {Promise<Object>} Fresh dashboard data or error
 */
export async function refreshDashboardDataAction(filter = "last7days") {
  console.log("[Dashboard] Manual refresh requested");
  return await getDashboardDataAction(filter);
}

/**
 * Get quick stats summary
 *
 * Lighter-weight action that only fetches overview statistics
 * without chart data. Useful for widgets or quick updates.
 *
 * @param {string} filter - Time period filter
 * @returns {Promise<Object>} Dashboard stats or error
 */
export async function getQuickStatsAction(filter = "last7days") {
  try {
    // Validate filter
    if (!isValidFilter(filter)) {
      filter = "last7days";
    }

    // Calculate date range
    const { startDate, endDate } = getDateRangeFromFilter(filter);

    // Fetch only stats (no charts)
    const statsResult = await getDashboardStats(startDate, endDate);

    if (statsResult.error) {
      return { error: statsResult.error };
    }

    return {
      success: true,
      stats: statsResult.stats,
    };
  } catch (error) {
    console.error("[Dashboard] Quick stats error:", error);
    return { error: "Failed to fetch quick stats" };
  }
}

/**
 * Get low stock alerts only
 *
 * Specialized action for fetching only low stock alerts.
 * Can be called independently for inventory monitoring.
 *
 * @param {number} threshold - Stock quantity threshold (default: 10)
 * @returns {Promise<Object>} Low stock items or error
 */
export async function getLowStockAlertsAction(threshold = 10) {
  try {
    const result = await getLowStockProducts(threshold);

    if (result.error) {
      return { error: result.error };
    }

    return {
      success: true,
      alerts: result.data,
      count: result.data.length,
    };
  } catch (error) {
    console.error("[Dashboard] Low stock alerts error:", error);
    return { error: "Failed to fetch low stock alerts" };
  }
}
