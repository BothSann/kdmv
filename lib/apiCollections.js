import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { PER_PAGE } from "@/lib/constants";

export async function getAllCollections({ page = 1, perPage = PER_PAGE } = {}) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  try {
    const { data: collections, error } = await supabaseAdmin
      .from("collections")
      .select("*")
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Collections fetch error:", error);
      return { error: "Failed to fetch collections" };
    }

    return {
      success: true,
      collections,
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
