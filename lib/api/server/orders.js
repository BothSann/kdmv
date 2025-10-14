import { PER_PAGE } from "@/lib/constants";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

export async function getUserOrders(
  userId,
  { page = 1, perPage = PER_PAGE } = {}
) {
  try {
    // STEP 1: Calculate pagination range
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // STEP 2: Fetch orders with related data
    const {
      data: orders,
      error: ordersError,
      count,
    } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items(
          quantity,
          product_name,
          products!order_items_product_id_fkey(
            banner_image_url
          )
        )
      `,
        { count: "exact" }
      )
      .eq("customer_id", userId)
      .range(from, to)
      .order("created_at", { ascending: false });

    // STEP 3: Handle errors
    if (ordersError) {
      console.error("Orders fetch error:", ordersError);
      return { error: "Failed to fetch orders" };
    }

    // STEP 4: Enrich orders with computed data
    const enrichedOrders = orders.map((order) => {
      // Calculate item count (number of different products)
      const item_count = order.order_items?.length || 0;

      // Calculate total quantity (sum of all quantities)
      const total_quantity =
        order.order_items?.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        ) || 0;

      // Transform order_items to include product data
      const items_with_product_info =
        order.order_items?.map((item) => ({
          quantity: item.quantity,
          product_name: item.product_name,
          banner_image_url: item.products?.banner_image_url || null,
        })) || [];

      return {
        ...order,
        item_count,
        total_quantity,
        items: items_with_product_info, // Renamed for clarity
        order_items: undefined, // Remove raw data
      };
    });

    // STEP 5: Return success with pagination
    return {
      success: true,
      orders: enrichedOrders,
      pagination: {
        page,
        perPage,
        count,
        totalPages: Math.ceil(count / perPage),
        hasNextPage: page * perPage < count,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { error: "Failed to fetch user orders" };
  }
}
