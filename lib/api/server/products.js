import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { PER_PAGE } from "@/lib/constants";
import { generateUniqueImageName } from "../../utils";

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
    const enrichedProducts = products.map((product) => {
      // Extract collection information (first collection if multiple)
      const collection = product.collection_products?.[0]?.collections || null;

      return {
        ...product,
        category_name: product.subcategories.categories.name,
        subcategory_name: product.subcategories.name,
        has_discount: product.discount_percentage > 0,
        discounted_price:
          product.discount_percentage > 0
            ? product.base_price * (1 - product.discount_percentage / 100)
            : product.base_price,
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

export async function uploadProductGalleryImages(productId, imageFiles) {
  try {
    const uploadPromises = imageFiles.map(async (file, index) => {
      const galleryImageName = generateUniqueImageName(file);
      const galleryImagePath = `gallery/${galleryImageName}`;

      // Upload to storage in gallery folder
      const { error: galleryStorageError } = await supabaseAdmin.storage
        .from("product-images")
        .upload(galleryImagePath, file);

      if (galleryStorageError) {
        console.error(
          `Gallery image ${index + 1} storage error:`,
          galleryStorageError
        );
        throw galleryStorageError;
      }

      // Insert into product_images table
      const fullImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${galleryImagePath}`;

      const { error: dbError } = await supabaseAdmin
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: fullImageUrl,
        });

      if (dbError) {
        console.error(`Gallery image ${index + 1} database error:`, dbError);
        throw dbError;
      }
    });

    await Promise.all(uploadPromises);

    return {
      success: true,
      message: `Successfully uploaded ${imageFiles.length} gallery image${
        imageFiles.length > 1 ? "s" : ""
      }`,
    };
  } catch (error) {
    console.error("Gallery images upload error:", error);
    return {
      error: error.message || "Failed to upload gallery images",
      success: false,
    };
  }
}

export async function deleteUnselectedProductImages(productId, imageIdsToKeep) {
  try {
    const { error: deleteImagesError } = await supabaseAdmin
      .from("product_images")
      .delete()
      .eq("product_id", productId)
      .not("id", "in", `(${imageIdsToKeep.join(",")})`);

    if (deleteImagesError) {
      console.error("Delete unselected images error:", deleteImagesError);
      return { error: deleteImagesError.message, success: false };
    }

    return { success: true, message: "Unselected images deleted successfully" };
  } catch (error) {
    console.error("Unexpected error in deleteUnselectedProductImages:", error);
    return { error: "An unexpected error occurred during image deletion" };
  }
}

export async function deleteAllProductImages(productId) {
  try {
    const { error: deleteAllImagesError } = await supabaseAdmin
      .from("product_images")
      .delete()
      .eq("product_id", productId);

    if (deleteAllImagesError) {
      console.error("Delete all images error:", deleteAllImagesError);
      return { error: deleteAllImagesError.message };
    }

    return {
      success: true,
      message: "All product images deleted successfully",
    };
  } catch (error) {
    console.error("Unexpected error in deleteAllProductImages:", error);
    return { error: "An unexpected error occurred during image deletion" };
  }
}
