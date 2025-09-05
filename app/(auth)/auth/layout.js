"use client";
import useAuthorization from "@/hooks/useAuthorization";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }) {
  const { isAuthenticated } = useAuthorization();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) router.push("/");
  }, [isAuthenticated, router]);

  return children;
}
