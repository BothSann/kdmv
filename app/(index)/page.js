import HomePageClient from "@/components/index/HomePageClient";
import {
  getCollectionProducts,
  getFeaturedCollections,
  getFeaturedProducts,
} from "@/lib/api/server/products";

export default async function Home() {
  let data = { collectionsWithProducts: [], featuredProducts: [] };

  try {
    const [featuredCollectionsRes, featuredProductsRes] =
      await Promise.allSettled([
        getFeaturedCollections({ limit: 2 }),
        getFeaturedProducts({ limit: 8 }),
      ]);

    const collections =
      featuredCollectionsRes.status === "fulfilled"
        ? featuredCollectionsRes.value.collections
        : [];

    const products =
      featuredProductsRes.status === "fulfilled"
        ? featuredProductsRes.value.products
        : [];

    const collectionsWithProducts = await Promise.all(
      collections.map(async (collection) => {
        try {
          const { products } = await getCollectionProducts(collection.slug, {
            limit: 4,
          });
          return { ...collection, products, error: false };
        } catch (error) {
          return { ...collection, products: [], error: true };
        }
      }) || []
    );

    data = { collectionsWithProducts, featuredProducts: products };
  } catch (error) {
    console.error("Error fetching products", error);
  }

  return <HomePageClient data={data} />;
}
