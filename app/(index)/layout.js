import HeaderWithCarousel from "@/components/HeaderWithCarousel";

export default function IndexLayout({ children }) {
  return (
    <div>
      <HeaderWithCarousel />
      <main className="max-w-7xl mx-auto w-full px-6 lg:px-8 pt-8 lg:pt-12">
        {children}
      </main>
    </div>
  );
}
