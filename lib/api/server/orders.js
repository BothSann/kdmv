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
      .eq("payment_status", "PAID")
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

export async function getOrderDetails(orderId, userId) {
  try {
    // Determine if orderId is UUID or order_number
    const isUUID = orderId.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );

    // STEP 1: Fetch order with all related data
    const query = supabaseAdmin
      .from("orders")
      .select(
        `
          *,
          order_items(
            id,
            product_name,
            quantity,
            unit_price,
            discount_percentage,
            total_price,
            products!order_items_product_id_fkey(
              banner_image_url,
              product_code
            ),
            colors(
              id,
              name,
              hex_code
            ),
            sizes(
              id,
              name
            )
          ),
          promo_codes(
            code,
            discount_percentage
          )
        `
      )
      .eq("customer_id", userId); // 🔒 SECURITY: Only user's orders

    // Query by either id or order_number
    if (isUUID) {
      query.eq("id", orderId);
    } else {
      query.eq("order_number", orderId);
    }

    const { data: order, error: orderError } = await query.single();

    // STEP 2: Handle errors
    if (orderError) {
      console.error("Order fetch error:", orderError);

      if (orderError.code === "PGRST116") {
        return { error: "Order not found or you don't have access" };
      }

      return { error: "Failed to fetch order details" };
    }

    if (!order) {
      return { error: "Order not found" };
    }

    // STEP 4: Enrich order data
    const enrichedOrder = {
      ...order,
    };

    // STEP 5: Return success
    return {
      success: true,
      order: enrichedOrder,
    };
  } catch (error) {
    console.error("Error fetching order details:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function getAllOrders({
  page = 1,
  perPage = PER_PAGE,
  status = null, // Filter by order status
  paymentStatus = null, // Filter by payment status
  searchQuery = null, // Search by order number or customer
  startDate = null, // Date range filter
  endDate = null,
} = {}) {
  try {
    // STEP 1: Calculate pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // STEP 2: Build base query
    let query = supabaseAdmin.from("orders").select(
      `
      *,
      profiles!orders_customer_id_fkey(
        id,
        first_name,
        last_name,
        email,
        telephone
      ),
      order_items(
        quantity,
        product_name,
        products!order_items_product_id_fkey(
          banner_image_url
        )
      ),
      promo_codes(
        code,
        discount_percentage
      )
    `,
      { count: "exact" }
    );

    // STEP 3: Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (paymentStatus) {
      query = query.eq("payment_status", paymentStatus);
    }

    //     if (searchQuery) {
    //       // Search by order number or customer name/email
    //       query = query.or(`order_number.ilike.%${searchQuery}%,profiles.first_name.ilike.%${searchQuery}%,profiles.last_name.ilike.%${searchQ
    // uery}%,profiles.email.ilike.%${searchQuery}%`);
    //     }

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    // STEP 4: Execute query with pagination
    const {
      data: orders,
      error,
      count,
    } = await query.range(from, to).order("created_at", { ascending: false });

    if (error) {
      console.error("Orders fetch error:", error);
      return { error: "Failed to fetch orders" };
    }

    // STEP 5: Enrich orders
    const enrichedOrders = orders.map((order) => {
      const customer = order.profiles;
      const customerName = `${customer.first_name} ${customer.last_name}`;

      const itemCount = order.order_items?.length || 0;
      const totalQuantity =
        order.order_items?.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        ) || 0;

      return {
        ...order,
        customer_name: customerName,
        customer_email: customer.email,
        customer_phone: customer.telephone,
        item_count: itemCount,
        total_quantity: totalQuantity,
        // Don't remove profiles - needed for detail view
      };
    });

    // STEP 6: Return with pagination
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
    console.error("Error fetching all orders:", error);
    return { error: "Failed to fetch all orders" };
  }
}
