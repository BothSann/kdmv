import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import {
  PER_PAGE,
  PRODUCT_SORT_OPTIONS,
  DEFAULT_PRODUCT_SORT,
} from "@/lib/constants";

export async function getAllCollections({ page = 1, perPage = PER_PAGE } = {}) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  try {
    const {
      data: collections,
      error,
      count,
    } = await supabaseAdmin
      .from("collections")
      .select("*", { count: "exact" })
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Collections fetch error:", error);
      return { error: "Failed to fetch collections" };
    }

    return {
      success: true,
      collections,
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
    console.error("Unexpected error in getAllCollections:", err);
    return { error: "An unexpected error occurred while fetching collections" };
  }
}

export async function getCollectionById(collectionId) {
  try {
    const { data: collection, error: collectionError } = await supabaseAdmin
      .from("collections")
      .select(
        `
        *,
        collection_products(
          products(
            id,
            name,
            banner_image_url,
            collection_products(
              collections(
                id,
                name,
                slug
              )
            )
          )
        )
      `
      )
      .eq("id", collectionId)
      .maybeSingle();

    if (collectionError) {
      console.error("Collection fetch error:", collectionError);
      return { error: "Failed to fetch collection" };
    }

    if (!collection) {
      return { error: "Collection not found" };
    }

    // Simplified transformation - only extract what you need
    const products =
      collection.collection_products?.map((cp) => {
        const product = cp.products;
        return {
          id: product.id,
          name: product.name,
          banner_image_url: product.banner_image_url,

          // Collection information (first collection if multiple)
          collection_name:
            product.collection_products?.[0]?.collections?.name || null,
          collection_slug:
            product.collection_products?.[0]?.collections?.slug || null,
          collection_id:
            product.collection_products?.[0]?.collections?.id || null,
        };
      }) || [];

    return {
      success: true,
      collection: {
        ...collection,
        products,
      },
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function getCollectionProducts(
  collectionSlug,
  { limit, page = 1, perPage = 20, sortBy = DEFAULT_PRODUCT_SORT } = {}
) {
  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Get sort configuration - fallback to default if invalid
    const sortConfig =
      PRODUCT_SORT_OPTIONS[sortBy] || PRODUCT_SORT_OPTIONS[DEFAULT_PRODUCT_SORT];

    const {
      data: collectionProducts,
      error: collectionProductsError,
      count,
    } = await supabaseAdmin
      .from("products")
      .select(
        `
          *,
          collection_products!inner(
            collections!inner(
              id,
              name,
              slug,
              description,
              banner_image_url
            )
          )
        `,
        { count: "exact" }
      )
      .eq("collection_products.collections.slug", collectionSlug)
      .eq("is_active", true)
      .is("deleted_at", null)
      .limit(limit)
      .range(from, to)
      .order(sortConfig.column, { ascending: sortConfig.ascending });

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
        collection_description:
          product.collection_products[0].collections.description,
        collection_banner_image_url:
          product.collection_products[0].collections.banner_image_url,
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
    console.error("Unexpected error in getCollectionProducts:", err);
    return {
      error: "An unexpected error occurred while fetching collection products",
    };
  }
}

export async function cleanUpCreatedCollection(collectionId) {
  try {
    const { error: deleteError } = await supabaseAdmin
      .from("collections")
      .delete()
      .eq("id", collectionId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { error: deleteError.message };
    }

    return { success: true, message: "Collection cleaned up successfully" };
  } catch (err) {
    console.error("Unexpected error in cleanUpCreatedCollection:", err);
    return { error: "An unexpected error occurred during collection cleanup" };
  }
}

export async function clearCollectionProducts(collectionId) {
  try {
    const { error: deleteError } = await supabaseAdmin
      .from("collection_products")
      .delete()
      .eq("collection_id", collectionId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { error: deleteError.message };
    }

    return {
      success: true,
      message: "Collection products cleared successfully",
    };
  } catch (err) {
    console.error("Unexpected error in clearCollectionProducts:", err);
    return {
      error: "An unexpected error occurred during collection products deletion",
    };
  }
}

export async function removeProductFromCollection(productId) {
  try {
    const { error: deleteError } = await supabaseAdmin
      .from("collection_products")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error("Delete from collections error:", deleteError);
      return { error: deleteError.message };
    }

    return {
      success: true,
      message: "Product removed from collection successfully",
    };
  } catch (err) {
    console.error("Unexpected error in removeProductFromCollection:", err);
    return {
      error:
        "An unexpected error occurred during product removal from collection",
    };
  }
}

export async function addProductToCollection(productId, collectionId) {
  try {
    const { error: addError } = await supabaseAdmin
      .from("collection_products")
      .insert({
        collection_id: collectionId,
        product_id: productId,
      });

    if (addError) {
      console.error("Add to collection error:", addError);
      return { error: addError.message };
    }

    return {
      success: true,
      message: "Product added to collection successfully",
    };
  } catch (err) {
    console.error("Unexpected error in addProductToCollection:", err);
    return {
      error:
        "An unexpected error occurred during product addition to collection",
    };
  }
}

/**
 * Get collection metadata by slug (without products)
 * Used for: metadata generation, breadcrumbs, headers
 */
export async function getCollectionBySlug(collectionSlug) {
  try {
    const { data: collection, error } = await supabaseAdmin
      .from("collections")
      .select("id, name, slug, description, banner_image_url, is_active")
      .eq("slug", collectionSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Collection fetch error:", error);
      return { error: "Failed to fetch collection" };
    }

    if (!collection) {
      return { error: "Collection not found" };
    }

    return {
      success: true,
      collection,
    };
  } catch (err) {
    console.error("Unexpected error in getCollectionBySlug:", err);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Get paginated products for a specific collection by slug
 * Used for: collection product listing page with pagination
 */
// export async function getCollectionProductsPaginated(
//   collectionSlug,
//   { page = 1, perPage = 20 } = {}
// ) {
//   try {
//     // Calculate pagination range
//     const from = (page - 1) * perPage;
//     const to = from + perPage - 1;

//     // Query products in this collection with full details
//     const {
//       data: products,
//       error,
//       count,
//     } = await supabaseAdmin
//       .from("products")
//       .select(
//         `
//         *,
//         subcategories!inner(
//           id,
//           name,
//           slug,
//           categories!inner(
//             id,
//             name,
//             slug
//           )
//         ),
//         product_variants(
//           id,
//           quantity,
//           color_id,
//           size_id
//         ),
//         collection_products!inner(
//           id,
//           display_order,
//           collections!inner(
//             id,
//             name,
//             slug,
//             description,
//             banner_image_url
//           )
//         )
//       `,
//         { count: "exact" }
//       )
//       .eq("collection_products.collections.slug", collectionSlug)
//       .eq("is_active", true)
//       .is("deleted_at", null)
//       .range(from, to)
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Collection products fetch error:", error);
//       return { error: "Failed to fetch collection products" };
//     }

//     // Check if collection exists (if no products, verify collection exists)
//     if (!products || products.length === 0) {
//       const { collection, error: collectionError } = await getCollectionBySlug(
//         collectionSlug
//       );

//       if (collectionError) {
//         return { error: "Collection not found" };
//       }

//       // Collection exists but has no products
//       return {
//         success: true,
//         products: [],
//         collection,
//         pagination: {
//           page,
//           perPage,
//           count: 0,
//           totalPages: 0,
//           hasNextPage: false,
//           hasPreviousPage: false,
//         },
//       };
//     }

//     // Enrich products with calculated fields
//     const enrichedProducts = products.map((product) => {
//       const collection = product.collection_products?.[0]?.collections || null;

//       return {
//         ...product,
//         // Category info
//         category_name: product.subcategories?.categories?.name || null,
//         subcategory_name: product.subcategories?.name || null,

//         // Price calculations
//         has_discount: product.discount_percentage > 0,
//         discounted_price:
//           product.discount_percentage > 0
//             ? product.base_price * (1 - product.discount_percentage / 100)
//             : product.base_price,

//         // Stock calculation
//         total_stock:
//           product.product_variants?.reduce(
//             (total, variant) => total + (variant.quantity || 0),
//             0
//           ) || 0,

//         // Collection info
//         collection_name: collection?.name || null,
//         collection_slug: collection?.slug || null,
//         collection_id: collection?.id || null,
//       };
//     });

//     // Extract collection metadata from first product
//     const collectionMetadata =
//       products[0]?.collection_products?.[0]?.collections;

//     return {
//       success: true,
//       products: enrichedProducts,
//       collection: collectionMetadata,
//       pagination: {
//         page,
//         perPage,
//         count,
//         totalPages: Math.ceil(count / perPage),
//         hasNextPage: page * perPage < count,
//         hasPreviousPage: page > 1,
//       },
//     };
//   } catch (err) {
//     console.error("Unexpected error in getCollectionProductsPaginated:", err);
//     return {
//       error: "An unexpected error occurred while fetching collection products",
//     };
//   }
// }
