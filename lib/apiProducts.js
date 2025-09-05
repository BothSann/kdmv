import { createSupabaseServerClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

export async function getAllProducts() {
  try {
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        *,
        subcategories!inner(
          id,
          name,
          categories!inner(
            id,
            name
          )
        ),
        product_variants(quantity)
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products fetch error:", error);
      return { error: "Failed to fetch products" };
    }

    // Calculate total stock for each product
    const productsWithStock = products.map((product) => ({
      ...product,
      category_name: product.subcategories.categories.name,
      subcategory_name: product.subcategories.name,
      total_stock: product.product_variants.reduce(
        (total, variant) => total + (variant.quantity || 0),
        0
      ),
    }));

    return {
      success: true,
      products: productsWithStock,
    };
  } catch (err) {
    console.error("Unexpected error in getAllProducts:", err);
    return { error: "An unexpected error occurred while fetching products" };
  }
}

export async function getProductById(productId) {
  try {
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        *,
        subcategories!inner(
          id,
          name,
          slug,
          categories!inner(
            id,
            name
          )
        ),
        product_variants(
          id,
          quantity,
          sku,
          colors(id, name, hex_code),
          sizes(id, name)
        ),
        product_images(id, image_url, display_order)
      `
      )
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Product fetch error:", error);
      return { error: "Failed to fetch product" };
    }

    if (!product) {
      return { error: "Product not found" };
    }

    // Calculate total stock
    const total_stock = product.product_variants.reduce(
      (total, variant) => total + (variant.quantity || 0),
      0
    );

    return {
      success: true,
      product: {
        ...product,
        category_name: product.subcategories.categories.name,
        subcategory_name: product.subcategories.name,
        slug: product.subcategories.slug,
        total_stock,
      },
    };
  } catch (err) {
    console.error("Unexpected error in getProductById:", err);
    return { error: "An unexpected error occurred while fetching product" };
  }
}
