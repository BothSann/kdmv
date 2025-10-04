"use client";
import useAuthStore from "@/store/useAuthStore";
import { useEffect } from "react";

export default function AuthProvider({ children }) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // INITIALIZE AUTH
    const unsubscribe = initializeAuth();

    return () => {
      unsubscribe;
    };
  }, [initializeAuth]);

  return children;
}
