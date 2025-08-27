import { getProductById } from "@/services/data-service";

export async function generateMetadata({ params }) {
  const { name } = await getProductById(params.productId);

  return {
    title: `${name}`,
  };
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
