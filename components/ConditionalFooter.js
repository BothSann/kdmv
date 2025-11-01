"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // List of path patterns where Footer should NOT appear
  const hideOnPaths = ["/account", "/admin"];

  // Check if current path matches any exclusion
  const shouldHide = hideOnPaths.some((path) => pathname.startsWith(path));

  // Don't render if should hide
  if (shouldHide) return null;

  // Otherwise render Footer
  return <Footer />;
}
