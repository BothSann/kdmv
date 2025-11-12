import ConditionalFooter from "@/components/ConditionalFooter";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import HeaderWithCarousel from "@/components/HeaderWithCarousel";

export const metadata = {
  title: "KDMV | Premium Lifestyle & Apparel Brand in Cambodia",
  description:
    "Shop premium lifestyle and apparel products from KDMV. Discover our latest collections featuring quality clothing, accessories, and more. Fast delivery across Cambodia.",

  openGraph: {
    title: "KDMV",
    description: "Shop premium lifestyle and apparel products from KDMV.",
    url: "/",
    images: [
      {
        url: "/kdmv_logo_1200x630px.jpg",
        width: 1200,
        height: 630,
        alt: "KDMV Homepage",
      },
    ],
  },

  alternates: {
    canonical: "/", // Prevents duplicate content issues
  },
};

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
