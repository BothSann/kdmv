import NotFound from "@/app/not-found";
import ProductCustomerDetail from "@/components/product/ProductCustomerDetail";
import ProductImageSlider from "@/components/product/ProductImageSlider";
import { getProductById } from "@/lib/apiProducts";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { product, error } = await getProductById(resolvedParams.productId);

  if (error || !product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `KDMV | ${product.name}`,
  };
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const productId = resolvedParams.productId;
  const { product, error } = await getProductById(productId);

  if (error || !product) {
    return <NotFound href="/" title="Product" />;
  }

  return (
    <div className="grid grid-cols-2 gap-20 items-start">
      <ProductImageSlider product={product} />
      <ProductCustomerDetail product={product} />
    </div>
  );
}
