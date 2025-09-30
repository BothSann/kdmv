import { getProductById } from "@/lib/apiProducts";
import { Button } from "@/components/ui/button";
import { PenLine, ChevronLeft } from "lucide-react";

import Link from "next/link";
import ProductDetailWithSelection from "@/components/product/ProductDetailWithSelection";
import DeleteProductButton from "@/components/product/DeleteProductButton";
import NotFound from "@/components/NotFound";
import ProductImageSlider from "@/components/product/ProductImageSlider";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { product, error } = await getProductById(resolvedParams.productId);

  if (error || !product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name}`,
  };
}
// If youe ever have a page that is not dynamic, you can use generateStaticParams to generate the static params
// This is useful for pages that are not dynamic and you want to pre-render the page

// export async function generateStaticParams() {
//   const products = await getAllProducts();
//   const productIds = products.map((product) => ({
//     productId: String(product.id),
//   }));

//   console.log(productIds);

//   return productIds;
// }

export default async function AdminProductDetailPage({ params }) {
  const resolvedParams = await params;
  const { product, error } = await getProductById(resolvedParams.productId);

  if (error || !product)
    return <NotFound href="/admin/products" title="Product" />;

  return (
    <>
      <Header product={product} />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6 mt-10">
        <ProductImageSlider product={product} />
        <ProductDetailWithSelection product={product} />
      </div>
    </>
  );
}

function Header({ product }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/products">
            <ChevronLeft />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold">{product.name}</h2>
      </div>

      {/* Edit and Delete buttons */}
      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/admin/products/${product.id}/edit`}>
            <PenLine />
            Edit
          </Link>
        </Button>
        <DeleteProductButton product={product} redirectTo="/admin/products" />
      </div>
    </div>
  );
}
