import { getAllProducts, getProductById } from "@/services/data-service";

export async function generateMetadata({ params }) {
  const { name } = await getProductById(params.productId);

  return {
    title: `${name}`,
  };
}
// If youe ever have a page that is not dynamic, you can use generateStaticParams to generate the static params
// This is useful for pages that are not dynamic and you want to pre-render the page

export async function generateStaticParams() {
  const products = await getAllProducts();
  const productIds = products.map((product) => ({
    productId: String(product.id),
  }));

  console.log(productIds);

  return productIds;
}

export default async function AdminProductDetailsPage({ params }) {
  const product = await getProductById(params.productId);

  return (
    <div>
      <h1>Product Details</h1>
      <p>Product ID: {product.id}</p>
    </div>
  );
}
