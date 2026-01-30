import {
  PER_PAGE,
  PRODUCT_SORT_OPTIONS,
  DEFAULT_PRODUCT_SORT,
} from "@/lib/constants";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

export async function getAllProducts({
  page = 1,
  perPage = PER_PAGE,
  includeDeleted = false,
  forAdmin = false,
  sortBy = DEFAULT_PRODUCT_SORT,
  productTypeId = null,
  genderId = null,
} = {}) {
  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Get sort configuration - fallback to default if invalid
    const sortConfig =
      PRODUCT_SORT_OPTIONS[sortBy] || PRODUCT_SORT_OPTIONS[DEFAULT_PRODUCT_SORT];

    // Build query with new product_types join (direct relationship)
    let query = supabaseAdmin
      .from("products")
      .select(
        `
        *,
        product_types!inner(
          id,
          name,
          slug
        ),
        genders(
          id,
          name,
          slug
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
      .order(sortConfig.column, { ascending: sortConfig.ascending });

    // Apply soft-delete filter conditionally
    if (!includeDeleted) {
      query = query.is("deleted_at", null);
    }

    // Apply product type filter
    if (productTypeId) {
      query = query.eq("product_type_id", productTypeId);
    }

    // Apply gender filter
    if (genderId) {
      query = query.eq("gender_id", genderId);
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
    product_type_name: product.product_types?.name || null,
    product_type_slug: product.product_types?.slug || null,
    gender_name: product.genders?.name || null,
    gender_slug: product.genders?.slug || null,
    has_discount: product.discount_percentage > 0,
    isDeleted: Boolean(product.deleted_at),
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
        product_types!inner(
          id,
          name,
          slug
        ),
        genders(
          id,
          name,
          slug
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
        product_type_name: product.product_types?.name || null,
        product_type_slug: product.product_types?.slug || null,
        gender_name: product.genders?.name || null,
        gender_slug: product.genders?.slug || null,
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
        variants_lookup: product.product_variants,
      },
    };
  } catch (err) {
    console.error("Unexpected error in getProductById:", err);
    return { error: "An unexpected error occurred while fetching product" };
  }
}

export async function getFeaturedProducts({ limit } = {}) {
  try {
    const { data: featuredProducts, error: featuredProductsError } =
      await supabaseAdmin
        .from("products")
        .select(
          `*, product_types(id, name, slug), genders(id, name, slug)`
        )
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (featuredProductsError) {
      console.error("Featured products fetch error:", featuredProductsError);
      return { error: "Failed to fetch featured products" };
    }

    const enrichedFeaturedProducts = featuredProducts.map((product) => {
      return {
        ...product,
        product_type_name: product.product_types?.name || null,
        product_type_slug: product.product_types?.slug || null,
        gender_name: product.genders?.name || null,
        gender_slug: product.genders?.slug || null,
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
  { productTypeId, genderId, collectionId, basePrice, limit = 8 }
) {
  try {
    let relatedProducts = [];
    const excludedIds = [currentProductId];

    // PHASE 1: SAME COLLECTION (Highest Priority)
    if (collectionId) {
      const { data: collectionProducts } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          product_types(id, name, slug),
          collection_products!inner(
            collections!inner(id, slug, name)
          )
        `
        )
        .eq("collection_products.collection_id", collectionId)
        .neq("id", currentProductId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .limit(limit);

      if (collectionProducts?.length > 0) {
        relatedProducts = [...collectionProducts];
        excludedIds.push(...collectionProducts.map((p) => p.id));
      }
    }

    if (relatedProducts.length >= limit) {
      return formatRelatedProducts(relatedProducts.slice(0, limit));
    }

    // PHASE 2: SAME PRODUCT TYPE + GENDER (Fill remaining slots)
    const remainingSlots = limit - relatedProducts.length;

    if (productTypeId && genderId && remainingSlots > 0) {
      const { data: sameTypeGenderProducts } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          product_types(id, name, slug)
        `
        )
        .eq("product_type_id", productTypeId)
        .eq("gender_id", genderId)
        .not("id", "in", `(${excludedIds.join(",")})`)
        .eq("is_active", true)
        .is("deleted_at", null)
        .limit(remainingSlots);

      if (sameTypeGenderProducts?.length > 0) {
        relatedProducts = [...relatedProducts, ...sameTypeGenderProducts];
        excludedIds.push(...sameTypeGenderProducts.map((p) => p.id));
      }
    }

    if (relatedProducts.length >= limit) {
      return formatRelatedProducts(relatedProducts.slice(0, limit));
    }

    // PHASE 3: SAME PRODUCT TYPE (any gender)
    const remainingSlots2 = limit - relatedProducts.length;

    if (productTypeId && remainingSlots2 > 0) {
      const { data: sameTypeProducts } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          product_types(id, name, slug)
        `
        )
        .eq("product_type_id", productTypeId)
        .not("id", "in", `(${excludedIds.join(",")})`)
        .eq("is_active", true)
        .is("deleted_at", null)
        .limit(remainingSlots2);

      if (sameTypeProducts?.length > 0) {
        relatedProducts = [...relatedProducts, ...sameTypeProducts];
        excludedIds.push(...sameTypeProducts.map((p) => p.id));
      }
    }

    if (relatedProducts.length >= limit) {
      return formatRelatedProducts(relatedProducts.slice(0, limit));
    }

    // PHASE 4: SIMILAR PRICE RANGE (±20%)
    const remainingSlots3 = limit - relatedProducts.length;

    if (basePrice && remainingSlots3 > 0) {
      const priceMin = basePrice * 0.8;
      const priceMax = basePrice * 1.2;

      const { data: similarPriceProducts } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          product_types(id, name, slug)
        `
        )
        .gte("base_price", priceMin)
        .lte("base_price", priceMax)
        .not("id", "in", `(${excludedIds.join(",")})`)
        .eq("is_active", true)
        .is("deleted_at", null)
        .limit(remainingSlots3);

      if (similarPriceProducts?.length > 0) {
        relatedProducts = [...relatedProducts, ...similarPriceProducts];
        excludedIds.push(...similarPriceProducts.map((p) => p.id));
      }
    }

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
          product_types(id, name, slug)
        `
        )
        .not("id", "in", `(${excludedIds.join(",")})`)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(remainingSlots4);

      if (recentProducts?.length > 0) {
        relatedProducts = [...relatedProducts, ...recentProducts];
      }
    }

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
    product_type_name: product.product_types?.name || null,
    product_type_slug: product.product_types?.slug || null,
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
    console.error("Unexpected error in getAllColors:", err);
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

export async function getAllProductTypes() {
  try {
    const { data: productTypes, error } = await supabaseAdmin
      .from("product_types")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Product types fetch error:", error);
      return { error: "Failed to fetch product types" };
    }

    return {
      success: true,
      productTypes,
    };
  } catch (err) {
    console.error("Unexpected error in getAllProductTypes:", err);
    return { error: "An unexpected error occurred while fetching product types" };
  }
}

export async function getProductsByType({
  productTypeSlug,
  genderId = null,
  page = 1,
  perPage = PER_PAGE,
  sortBy = DEFAULT_PRODUCT_SORT,
} = {}) {
  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const sortConfig =
      PRODUCT_SORT_OPTIONS[sortBy] || PRODUCT_SORT_OPTIONS[DEFAULT_PRODUCT_SORT];

    let query = supabaseAdmin
      .from("products")
      .select(
        `
        *,
        product_types!inner(
          id,
          name,
          slug
        ),
        genders(
          id,
          name,
          slug
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
        { count: "exact" }
      )
      .eq("product_types.slug", productTypeSlug)
      .eq("is_active", true)
      .is("deleted_at", null)
      .range(from, to)
      .order(sortConfig.column, { ascending: sortConfig.ascending });

    if (genderId) {
      query = query.eq("gender_id", genderId);
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error("Products by type fetch error:", error);
      return { error: "Failed to fetch products by type" };
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
    console.error("Unexpected error in getProductsByType:", err);
    return { error: "An unexpected error occurred while fetching products by type" };
  }
}

export async function searchProducts({
  query = "",
  page = 1,
  perPage = 20,
  productTypeId = null,
  genderId = null,
} = {}) {
  try {
    // Early return: if no query provided, return empty results
    if (!query.trim()) {
      return {
        success: true,
        products: [],
        pagination: {
          page: 1,
          perPage,
          count: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        query: "",
      };
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    const searchTerm = query.trim();

    let searchQuery = supabaseAdmin
      .from("products")
      .select(
        `
        *,
        product_types!inner(
          id,
          name,
          slug
        ),
        genders(
          id,
          name,
          slug
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
        { count: "exact" }
      )
      .or(
        `name.ilike.%${searchTerm}%,` +
        `description.ilike.%${searchTerm}%,` +
        `product_code.ilike.%${searchTerm}%`
      )
      .is("deleted_at", null)
      .eq("is_active", true)
      .range(from, to)
      .order("created_at", { ascending: false });

    // Apply optional filters
    if (productTypeId) {
      searchQuery = searchQuery.eq("product_type_id", productTypeId);
    }

    if (genderId) {
      searchQuery = searchQuery.eq("gender_id", genderId);
    }

    const { data: products, error, count } = await searchQuery;

    if (error) {
      console.error("Search error:", error);
      return { error: "Failed to search products" };
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
      query: searchTerm,
    };
  } catch (err) {
    console.error("Unexpected error in searchProducts:", err);
    return { error: "An unexpected error occurred during search" };
  }
}

export async function getAllGenders() {
  try {
    const { data: genders, error } = await supabaseAdmin
      .from("genders")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Genders fetch error:", error);
      return { error: "Failed to fetch genders" };
    }

    return {
      success: true,
      genders,
    };
  } catch (err) {
    console.error("Unexpected error in getAllGenders:", err);
    return { error: "An unexpected error occurred while fetching genders" };
  }
}
