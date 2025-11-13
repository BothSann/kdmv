"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AOSProvider({ children }) {
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      // Global settings
      offset: 100, // Offset (in px) from original trigger point
      duration: 800, // Duration of animation (ms)
      easing: "ease-in-out", // Easing function
      delay: 0, // Delay before animation starts
      once: false, // Animation happens every time (false) or once (true)
      mirror: false, // Elements animate out while scrolling past them
      anchorPlacement: "top-bottom", // Where animation triggers
    });

    // Refresh AOS on route changes (Next.js App Router)
    return () => {
      AOS.refresh();
    };
  }, []);

  return <>{children}</>;
}
