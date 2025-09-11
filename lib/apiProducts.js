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
      has_discount: product.discount_percentage > 0,
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
      // Check if it's just "not found" vs actual error (happens when product is deleted)
      if (error.code === "PGRST116") {
        console.log("Product not found:", productId);
        return { product: null }; // Don't treat as error
      }

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

    // Calculate discounted price
    const discountedPrice =
      product.discount_percentage > 0
        ? product.base_price * (1 - product.discount_percentage / 100)
        : product.base_price;

    // Extract unique colors from variants
    const uniqueColors = product.product_variants.reduce((acc, variant) => {
      if (
        variant.colors &&
        !acc.find((color) => color.id === variant.colors.id)
      ) {
        acc.push(variant.colors);
      }
      return acc;
    }, []);

    // Extract unique sizes from variants
    const uniqueSizes = product.product_variants.reduce((acc, variant) => {
      if (variant.sizes && !acc.find((size) => size.id === variant.sizes.id)) {
        acc.push(variant.sizes);
      }
      return acc;
    }, []);

    return {
      success: true,
      product: {
        ...product,
        category_name: product.subcategories.categories.name,
        subcategory_name: product.subcategories.name,
        slug: product.subcategories.slug,
        total_stock,
        discounted_price: discountedPrice,
        has_discount: product.discount_percentage > 0,
        // New properties for unique colors and sizes
        available_colors: uniqueColors,
        available_sizes: uniqueSizes,
        variants_lookup: product.product_variants, // Keep full variants for lookups
      },
    };
  } catch (err) {
    console.error("Unexpected error in getProductById:", err);
    return { error: "An unexpected error occurred while fetching product" };
  }
}

export async function getAllColors() {
  try {
    const { data: colors, error } = await supabaseAdmin
      .from("colors")
      .select("*");

    if (error) {
      console.error("Colors fetch error:", error);
      return { error: "Failed to fetch colors" };
    }

    return {
      success: true,
      colors,
    };
  } catch (err) {
    console.error("Unexpected error in getAllColorss:", err);
    return { error: "An unexpected error occurred while fetching colors" };
  }
}

export async function getAllSizes() {
  try {
    const { data: sizes, error } = await supabaseAdmin
      .from("sizes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Sizes fetch error:", error);
      return { error: "Failed to fetch sizes" };
    }

    return {
      success: true,
      sizes,
    };
  } catch (err) {
    console.error("Unexpected error in getAllSizes:", err);
    return { error: "An unexpected error occurred while fetching sizes" };
  }
}

export async function getAllCategories() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Categories fetch error:", error);
      return { error: "Failed to fetch categories" };
    }

    return {
      success: true,
      categories,
    };
  } catch (err) {
    console.error("Unexpected error in getAllCategories:", err);
    return { error: "An unexpected error occurred while fetching categories" };
  }
}

export async function getAllSubcategories() {
  try {
    const { data: subcategories, error } = await supabaseAdmin
      .from("subcategories")
      .select(
        `
      *,
      categories!inner(
        id,
        name
      )
    `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Subcategories fetch error:", error);
      return { error: "Failed to fetch subcategories" };
    }

    return {
      success: true,
      subcategories,
    };
  } catch (err) {
    console.error("Unexpected error in getAllSubcategories:", err);
    return {
      error: "An unexpected error occurred while fetching subcategories",
    };
  }
}
