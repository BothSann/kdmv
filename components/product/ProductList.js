import ProductItem from "./ProductItem";

export default function ProductList({ products }) {
  return (
    <ul className="grid grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </ul>
  );
}
