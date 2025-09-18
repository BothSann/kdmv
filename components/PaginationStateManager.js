"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useUIStore from "@/store/useUIStore";

export default function PaginationStateManager() {
  const searchParams = useSearchParams();
  const setPaginating = useUIStore((state) => state.setPaginating);

  useEffect(() => {
    // Reset pagination loading state when search params change
    setPaginating(false);
  }, [searchParams, setPaginating]);

  return null; // This component doesn't render anything
}
