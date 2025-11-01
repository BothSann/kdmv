import Footer from "@/components/Footer";
import HeaderWithCarousel from "@/components/HeaderWithCarousel";

export default function IndexLayout({ children }) {
  return (
    <div>
      <HeaderWithCarousel />
      <main className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-6 lg:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
