"use client";

import useUIStore from "@/store/useUIStore";

export default function PageOverlay() {
  const isPaginating = useUIStore((state) => state.isPaginating);

  if (!isPaginating) return null;

  return (
    <div className="fixed inset-0 bg-background/50 z-100 backdrop-blur-xs pointer-events-none transition-opacity duration-200" />
  );
}
