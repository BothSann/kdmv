import ProductDetailCarousel from "@/components/ProductDetailCarousel";

export default function Detail() {
  return (
    <div className="grid grid-cols-2">
      <div>
        <ProductDetailCarousel />
      </div>
      <div>Right</div>
    </div>
  );
}
