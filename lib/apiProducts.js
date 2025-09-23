import { createSupabaseServerClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { PER_PAGE } from "@/lib/constants";

export async function getAllProducts({ page = 1, perPage = PER_PAGE } = {}) {
  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const {
      data: products,
      error,
      count,
    } = await supabaseAdmin
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
        product_variants(quantity),
        collection_products(
          collections(
            id,
            name,
            slug
          )
        )
      `,
        {
          count: "exact",
        }
      )
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products fetch error:", error);
      return { error: "Failed to fetch products" };
    }

    // Calculate total stock and add collection info for each product
    const productsWithStock = products.map((product) => {
      // Extract collection information (first collection if multiple)
      const collection = product.collection_products?.[0]?.collections || null;

      return {
        ...product,
        category_name: product.subcategories.categories.name,
        subcategory_name: product.subcategories.name,
        has_discount: product.discount_percentage > 0,
        total_stock: product.product_variants.reduce(
          (total, variant) => total + (variant.quantity || 0),
          0
        ),
        // Collection information
        collection_name: collection?.name || null,
        collection_slug: collection?.slug || null,
        collection_id: collection?.id || null,
      };
    });

    return {
      success: true,
      products: productsWithStock,
      pagination: {
        page,
        perPage,
        count,
        totalPages: Math.ceil(count / perPage),
        hasNextPage: page * perPage < count,
        hasPreviousPage: page > 1,
      },
    };
  } catch (err) {
    console.error("Unexpected error in getAllProducts:", err);
    return { error: "An unexpected error occurred while fetching products" };
  }
}

export async function getProductById(productId) {
  try {
    const { data: product, error: productError } = await supabaseAdmin
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
        product_images(id, image_url, display_order),
        collection_products(
          collections(
            id,
            name,
            slug
          )
        )
      `
      )
      .eq("id", productId)
      .eq("is_active", true)
      .maybeSingle();

    if (productError) {
      console.error("Product fetch error:", productError);
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

    // Extract collection information (first collection if multiple)
    const collection = product.collection_products?.[0]?.collections || null;

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
        // Collection information
        collection_name: collection?.name || null,
        collection_slug: collection?.slug || null,
        collection_id: collection?.id || null,
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
      .order("created_at", { ascending: true });

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

export async function generateSKU(productCode, colorId, sizeId) {
  try {
    const [colorResult, sizeResult] = await Promise.all([
      supabaseAdmin
        .from("colors")
        .select("slug, name")
        .eq("id", colorId)
        .single(),
      supabaseAdmin
        .from("sizes")
        .select("slug, name")
        .eq("id", sizeId)
        .single(),
    ]);

    const colorCode =
      (
        colorResult.data?.slug || colorResult.data?.name?.substring(0, 3)
      )?.toUpperCase() || "UNK";

    const sizeCode =
      (sizeResult.data?.slug || sizeResult.data?.name)?.toUpperCase() || "UNK";

    return `${productCode}-${colorCode}-${sizeCode}`;
  } catch (err) {
    console.error("Error generating SKU:", err);
    return `${productCode}-${colorId.slice(-8)}-${sizeId.slice(-8)}`;
  }
}

export async function generateUniqueProductCode() {
  try {
    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const code = Math.floor(Math.random() * 10000000000)
        .toString()
        .padStart(11, "0");

      // Check if code exists in database
      const { data: existingProduct } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("product_code", code)
        .maybeSingle();

      if (!existingProduct) {
        return code; // Code is unique
      }

      attempts++;
    }
  } catch (err) {
    console.error("Error generating unique product code:", err);
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

export async function cleanUpCreatedProduct(productId) {
  try {
    const { error: deleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { error: "Failed to delete product" };
    }

    return { success: true, message: "Product cleaned up successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during product cleanup" };
  }
}
