import ConditionalFooter from "@/components/ConditionalFooter";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import HeaderWithCarousel from "@/components/HeaderWithCarousel";

export default function IndexLayout({ children }) {
  return (
    <div>
      {/* Warning Banner */}
      <DisclaimerBanner />

      <HeaderWithCarousel />
      <main className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-6 lg:py-12">
        {children}
      </main>
      <ConditionalFooter />
    </div>
  );
}
