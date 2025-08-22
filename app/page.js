import ProductList from "@/components/ProductList";
import Carousel from "@/components/MainCarousel";
import CartDrawer from "@/components/CartDrawer";
import CartDrawerII from "@/components/CartDrawer";

export default function Home() {
  return (
    <div>
      <Carousel />
      <ProductList />
      {/* <CartDrawer /> */}
    </div>
  );
}
