import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

export async function getAllProducts({
  page = 1,
  perPage,
  includeDeleted = false,
  forAdmin = false, // Optional flag if needed for additional admin-specific logic
} = {}) {
  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Build query
    const query = supabaseAdmin
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

    // Apply soft-delete filter conditionally
    if (!includeDeleted) {
      query.is("deleted_at", null);
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error("Products fetch error:", error);
      return { error: "Failed to fetch products" };
    }

    const enrichedProducts = products.map(enrichProductData);

    return {
      success: true,
      products: enrichedProducts,
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

function enrichProductData(product) {
  const collection = product.collection_products?.[0]?.collections || null;

  return {
    ...product,
    category_name: product.subcategories.categories.name,
    subcategory_name: product.subcategories.name,
    has_discount: product.discount_percentage > 0,
    isDeleted: Boolean(product.deleted_at), // Always include for consistency
    discounted_price:
      product.discount_percentage > 0
        ? product.base_price * (1 - product.discount_percentage / 100)
        : product.base_price,
    total_stock: product.product_variants.reduce(
      (total, variant) => total + (variant.quantity || 0),
      0
    ),
    collection_name: collection?.name || null,
    collection_slug: collection?.slug || null,
    collection_id: collection?.id || null,
  };
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
          colors(id, name, hex_code, slug),
          sizes(id, name, slug, display_order)
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
      .is("deleted_at", null)
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
    const uniqueSizes = product.product_variants
      .reduce((acc, variant) => {
        if (
          variant.sizes &&
          !acc.find((size) => size.id === variant.sizes.id)
        ) {
          acc.push(variant.sizes);
        }
        return acc;
      }, [])
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

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

export async function getCollectionProducts(collectionSlug, { limit } = {}) {
  try {
    const { data: collectionProducts, error: collectionProductsError } =
      await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          collection_products!inner(
            collections!inner(
              id,
              name,
              slug
            )
          )
        `,
          { count: "exact" }
        )
        .eq("collection_products.collections.slug", collectionSlug)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (collectionProductsError) {
      console.error(
        "Collection products fetch error:",
        collectionProductsError
      );
      return { error: "Failed to fetch collection products" };
    }

    const enrichedCollectionProducts = collectionProducts.map((product) => {
      return {
        ...product,
        collection_name: product.collection_products[0].collections.name,
        collection_slug: product.collection_products[0].collections.slug,
        has_discount: product.discount_percentage > 0,
        discounted_price:
          product.discount_percentage > 0
            ? product.base_price * (1 - product.discount_percentage / 100)
            : product.base_price,
      };
    });

    return {
      success: true,
      products: enrichedCollectionProducts,
    };
  } catch (err) {
    console.error("Unexpected error in getCollectionProducts:", err);
    return {
      error: "An unexpected error occurred while fetching collection products",
    };
  }
}

export async function getFeaturedProducts({ limit } = {}) {
  try {
    const { data: featuredProducts, error: featuredProductsError } =
      await supabaseAdmin
        .from("products")
        .select(`*, subcategories(name, categories(name))`)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (featuredProductsError) {
      console.error("Featured products fetch error:", featuredProductsError);
      return { error: "Failed to fetch featured products" };
    }

    const enrichedFeaturedProducts = featuredProducts.map((product) => {
      return {
        ...product,
        category_name: product.subcategories.categories.name,
        subcategory_name: product.subcategories.name,
        has_discount: product.discount_percentage > 0,
        discounted_price:
          product.discount_percentage > 0
            ? product.base_price * (1 - product.discount_percentage / 100)
            : product.base_price,
      };
    });

    return {
      success: true,
      products: enrichedFeaturedProducts,
    };
  } catch (err) {
    console.error("Unexpected error in getFeaturedProducts:", err);
    return {
      error: "An unexpected error occurred while fetching featured products",
    };
  }
}

export async function getFeaturedCollections({ limit } = {}) {
  try {
    const { data: featuredCollections, error: featuredCollectionsError } =
      await supabaseAdmin
        .from("collections")
        .select("id, name, slug, description, banner_image_url")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(limit);

    if (featuredCollectionsError) {
      console.error(
        "Featured collections fetch error:",
        featuredCollectionsError
      );
      return { error: "Failed to fetch featured collections" };
    }

    return {
      success: true,
      collections: featuredCollections,
    };
  } catch (err) {
    console.error("Unexpected error in getFeaturedCollections:", err);
    return {
      error: "An unexpected error occurred while fetching featured collections",
    };
  }
}

export async function getRelatedProducts(
  currentProductId,
  { subcategoryId, categoryId, collectionId, basePrice, limit = 8 }
) {
  try {
    let relatedProducts = [];
    const excludedIds = [currentProductId]; // Track IDs to exclude

    // PHASE 1: SAME COLLECTION (Highest Priority)
    if (collectionId) {
      const { data: collectionProducts } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          subcategories(name, categories(name)),
          collection_products!inner(
            collections!inner(id, slug, name)
          )
        `
        )
        .eq("collection_products.collection_id", collectionId)
        .neq("id", currentProductId)
        .eq("is_active", true)
        .limit(limit);

      if (collectionProducts?.length > 0) {
        relatedProducts = [...collectionProducts];
        excludedIds.push(...collectionProducts.map((p) => p.id));
      }
    }

    // Check if we have enough products
    if (relatedProducts.length >= limit) {
      return formatRelatedProducts(relatedProducts.slice(0, limit));
    }

    // PHASE 2: SAME SUBCATEGORY (Fill remaining slots)
    const remainingSlots = limit - relatedProducts.length;

    if (subcategoryId && remainingSlots > 0) {
      const { data: subcategoryProducts } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          subcategories!inner(id, name, categories(name))
        `
        )
        .eq("subcategories.id", subcategoryId)
        .not("id", "in", `(${excludedIds.join(",")})`)
        .eq("is_active", true)
        .limit(remainingSlots);

      if (subcategoryProducts?.length > 0) {
        relatedProducts = [...relatedProducts, ...subcategoryProducts];
        excludedIds.push(...subcategoryProducts.map((p) => p.id));
      }
    }

    // Check again
    if (relatedProducts.length >= limit) {
      return formatRelatedProducts(relatedProducts.slice(0, limit));
    }

    // PHASE 3: SAME CATEGORY (Broader search)
    const remainingSlots2 = limit - relatedProducts.length;

    if (categoryId && remainingSlots2 > 0) {
      const { data: categoryProducts } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          subcategories!inner(
            id, name,
            categories!inner(id, name)
          )
        `
        )
        .eq("subcategories.categories.id", categoryId)
        .not("id", "in", `(${excludedIds.join(",")})`)
        .eq("is_active", true)
        .limit(remainingSlots2);

      if (categoryProducts?.length > 0) {
        relatedProducts = [...relatedProducts, ...categoryProducts];
        excludedIds.push(...categoryProducts.map((p) => p.id));
      }
    }

    // Check again
    if (relatedProducts.length >= limit) {
      return formatRelatedProducts(relatedProducts.slice(0, limit));
    }

    // PHASE 4: SIMILAR PRICE RANGE (±20%)
    const remainingSlots3 = limit - relatedProducts.length;

    if (basePrice && remainingSlots3 > 0) {
      const priceMin = basePrice * 0.8; // 20% lower
      const priceMax = basePrice * 1.2; // 20% higher

      const { data: similarPriceProducts } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          subcategories(name, categories(name))
        `
        )
        .gte("base_price", priceMin)
        .lte("base_price", priceMax)
        .not("id", "in", `(${excludedIds.join(",")})`)
        .eq("is_active", true)
        .limit(remainingSlots3);

      if (similarPriceProducts?.length > 0) {
        relatedProducts = [...relatedProducts, ...similarPriceProducts];
        excludedIds.push(...similarPriceProducts.map((p) => p.id));
      }
    }

    // Check again
    if (relatedProducts.length >= limit) {
      return formatRelatedProducts(relatedProducts.slice(0, limit));
    }

    // PHASE 5: RECENT PRODUCTS (Last resort fallback)
    const remainingSlots4 = limit - relatedProducts.length;

    if (remainingSlots4 > 0) {
      const { data: recentProducts } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          subcategories(name, categories(name))
        `
        )
        .not("id", "in", `(${excludedIds.join(",")})`)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(remainingSlots4);

      if (recentProducts?.length > 0) {
        relatedProducts = [...relatedProducts, ...recentProducts];
      }
    }

    // RETURN FORMATTED RESULTS
    return formatRelatedProducts(relatedProducts.slice(0, limit));
  } catch (err) {
    console.error("Unexpected error in getRelatedProducts:", err);
    return {
      error: "Failed to fetch related products",
      relatedProducts: [],
    };
  }
}

function formatRelatedProducts(products) {
  const enrichedProducts = products.map((product) => ({
    ...product,
    category_name: product.subcategories?.categories?.name || null,
    subcategory_name: product.subcategories?.name || null,
    has_discount: product.discount_percentage > 0,
    discounted_price:
      product.discount_percentage > 0
        ? product.base_price * (1 - product.discount_percentage / 100)
        : product.base_price,
  }));

  return {
    success: true,
    relatedProducts: enrichedProducts,
    count: enrichedProducts.length,
  };
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
      .order("display_order", { ascending: true });

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
