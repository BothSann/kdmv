import { poppins, jost, sourceSans3, nunitoSans } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "react-photo-view/dist/react-photo-view.css";

import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export const metadata = {
  title: "KDMV | Khmer Digital Marketing Venture",
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="lMGrRLMEbXBQWY9WM9k0vQvHZ3-MKZlDAHOS8ZsZQMs"
        />
        <title>{metadata.title}</title>
      </head>
      <body
        className={`${poppins.className} ${poppins.variable} ${jost.variable} ${sourceSans3.variable} ${nunitoSans.variable} antialiased min-h-screen scrollbar-custom`}
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
