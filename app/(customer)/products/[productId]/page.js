import { Suspense } from "react";
import NotFound from "@/app/not-found";
import ProductCustomerDetail from "@/components/product/ProductCustomerDetail";
import ProductImageSlider from "@/components/product/ProductImageSlider";
import { getProductById, getRelatedProducts } from "@/lib/api/products";
import Spinner from "@/components/Spinner";
import RelatedProducts from "@/components/product/RelatedProducts";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { product, error } = await getProductById(resolvedParams.productId);

  if (error || !product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | KDMV`,
    description: product.description,
    authors: [{ name: "KDMV" }],
    publisher: "KDMV",

    openGraph: {
      type: "website",
      locale: "en_US",
      url: `https://kdmv.store/products/${product.id}`,
      title: `${product.name} | KDMV`,
      description: product.description,
      siteName: "KDMV",
      images: [
        {
          url: product.banner_image_url,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },

    twitter: {
      title: `${product.name} | KDMV`,
      description: product.description,
      images: [product.banner_image_url],
      creator: "@KDMV",
      site: "@KDMV",
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const productId = resolvedParams.productId;
  const { product, error } = await getProductById(productId);

  if (error || !product) {
    return <NotFound href="/" title="Product" />;
  }

  const { relatedProducts } = await getRelatedProducts(productId, {
    subcategoryId: product.subcategory_id,
    categoryId: product.category_id,
    collectionId: product.collection_id,
    basePrice: product.base_price,
    limit: 8,
  });

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-start">
        <ProductImageSlider product={product} />

        {/* Suspense required for useSearchParams in Next.js 15 */}
        <Suspense fallback={<Spinner />}>
          <ProductCustomerDetail key={productId} product={product} />
        </Suspense>
      </div>

      <div className="pt-16 space-y-12">
        <RelatedProducts products={relatedProducts} title="You may also like" />
      </div>
    </div>
  );
}
