import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import {
  PER_PAGE,
  PRODUCT_SORT_OPTIONS,
  DEFAULT_PRODUCT_SORT,
} from "@/lib/constants";

/**
 * Collection Data Layer - QUERIES ONLY
 * All mutations have been moved to server/actions/collection-action.js
 */

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
