"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const shouldHide = ["/account", "/admin"].some((p) => pathname.startsWith(p));

  if (shouldHide) return null;

  return <Footer />;
}
