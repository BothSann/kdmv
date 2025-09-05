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
  const { user, isLoading, role } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push(redirectTo);
    if (!isLoading && user && !allowedRoles.includes(role)) {
      console.log(user, role, allowedRoles);
      router.push("/unauthorized");
    }
  }, [role, user, isLoading, router, allowedRoles, redirectTo]);

  if (isLoading) return <Spinner />;

  if (!user || !allowedRoles.includes(role)) {
    return null;
  }

  return children;
}
