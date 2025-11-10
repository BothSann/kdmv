import { poppins, jost, sourceSans3, nunitoSans } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "react-photo-view/dist/react-photo-view.css";

import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
  title: {
    default: "KDMV - Premium Lifestyle & Apparel Brand in Cambodia",
    template: "%s | KDMV",
  },
  description:
    "KDMV is a leading local digital marketing agency in Cambodia, specializing in video content and social media marketing, with an e-commerce component for its own in-house lifestyle/apparel brand.",
  keywords: [
    "KDMV",
    "UN:CM",
    "kdmv.io",
    "Khmer Digital Marketing Venture",
    "Digital Marketing Agency in Cambodia",
  ],

  // Authors & creators
  authors: [{ name: "KDMV" }],
  creator: "KDMV",
  publisher: "KDMV",

  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kdmv.store",
    siteName: "KDMV",
    title: "KDMV",
    description:
      "Discover premium lifestyle and apparel products from Cambodia's leading digital marketing agency.",
    images: [
      {
        url: "/kdmv_logo_1200x630px.jpg", // Create this 1200x630px image
        width: 1200,
        height: 630,
        alt: "KDMV Brand",
      },
    ],
  },

  // Robot directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "8070bc557f4db90c",
  },
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="lMGrRLMEbXBQWY9WM9k0vQvHZ3-MKZlDAHOS8ZsZQMs"
        />
      </head>
      <body
        className={`${poppins.className} ${poppins.variable} ${jost.variable} ${sourceSans3.variable} ${nunitoSans.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster richColors position="top-center" expand visibleToasts={1} />

          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
