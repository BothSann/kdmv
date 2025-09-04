"use client";

import Spinner from "@/components/Spinner";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  allowedRoles = ["admin", "customer"],
  redirectTo = "/auth/login",
}) {
  const router = useRouter();
  const { user, isLoading, role } = useAuthStore();
  // 1. Load the authenticated user
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }

    if (!isLoading && user && !allowedRoles.includes(role)) {
      console.log(user, role, allowedRoles);
      router.push("/unauthorized");
    }
  }, [role, user, isLoading, router, allowedRoles, redirectTo]);

  // 2. While loading, show a loading spinner
  if (isLoading) return <Spinner />;

  if (!user || !allowedRoles.includes(role)) {
    return null;
  }

  return children;
}
