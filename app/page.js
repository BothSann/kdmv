import ProductList from "@/components/ProductList";
import Carousel from "@/components/MainCarousel";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
      <Carousel />
      <ProductList />
      <Footer />
      {/* <CartDrawer /> */}
    </div>
  );
}
