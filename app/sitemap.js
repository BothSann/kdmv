import { getBaseUrl } from "@/lib/config";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

/**
 * Generates a dynamic sitemap for the KDMV e-commerce store
 * Includes: static pages, products, collections, and categories
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap() {
  const baseUrl = getBaseUrl();

  // Static pages with their priorities and change frequencies
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Fetch all active products
  const products = await getActiveProducts();
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updated_at
      ? new Date(product.updated_at)
      : new Date(product.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Fetch all active collections
  const collections = await getActiveCollections();
  const collectionRoutes = collections.map((collection) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    lastModified: collection.updated_at
      ? new Date(collection.updated_at)
      : new Date(collection.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Fetch all categories (optional - if you have category listing pages)
  const categories = await getActiveCategories();
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/products?category=${category.slug}`,
    lastModified: new Date(category.created_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Combine all routes
  return [
    ...staticRoutes,
    ...productRoutes,
    ...collectionRoutes,
    ...categoryRoutes,
  ];
}

/**
 * Fetch all active products from the database
 */
async function getActiveProducts() {
  try {
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, created_at, updated_at")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products for sitemap:", error);
      return [];
    }

    return products || [];
  } catch (error) {
    console.error("Unexpected error fetching products:", error);
    return [];
  }
}

/**
 * Fetch all active collections from the database
 */
async function getActiveCollections() {
  try {
    const { data: collections, error } = await supabaseAdmin
      .from("collections")
      .select("slug, created_at, updated_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching collections for sitemap:", error);
      return [];
    }

    return collections || [];
  } catch (error) {
    console.error("Unexpected error fetching collections:", error);
    return [];
  }
}

/**
 * Fetch all active categories from the database
 */
async function getActiveCategories() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("slug, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching categories for sitemap:", error);
      return [];
    }

    return categories || [];
  } catch (error) {
    console.error("Unexpected error fetching categories:", error);
    return [];
  }
}
