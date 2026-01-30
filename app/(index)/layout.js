import ConditionalFooter from "@/components/ConditionalFooter";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import HeaderWithCarousel from "@/components/HeaderWithCarousel";
import { getActiveBanners } from "@/lib/data/banners";

export const metadata = {
  title: "KDMV | Khmer Digital Marketing Venture",
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

export default async function IndexLayout({ children }) {
  // Fetch active banners for the homepage carousel
  const { banners } = await getActiveBanners();

  return (
    <div>
      {/* Warning Banner */}
      <DisclaimerBanner />

      <HeaderWithCarousel banners={banners} />
      <main className="max-w-7xl mx-auto w-full px-6 md:px-8 lg:px-10 py-6 lg:py-12">
        {children}
      </main>
      <ConditionalFooter />
    </div>
  );
}
