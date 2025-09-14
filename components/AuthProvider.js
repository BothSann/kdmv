"use client";
import useAuthStore from "@/store/useAuthStore";
import { useEffect } from "react";
import { createSupabaseFrontendClient } from "@/utils/supabase/client";

export default function AuthProvider({ children }) {
  const { initAuth, setUser, setProfile, clearAuth } = useAuthStore();

  useEffect(() => {
    const supabase = createSupabaseFrontendClient();

    // INITIALIZE AUTH
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((session, event) => {
      switch (event) {
        // Grouping "INITIAL_SESSION" and "SIGNED_IN" events together to avoid duplicate code
        case "INITIAL_SESSION":
        case "SIGNED_IN":
          if (session?.user) {
            setUser(session.user);
          }

          setTimeout(async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

              if (!profileError && profile) {
                setProfile(profile);
              }
            } catch (error) {
              console.error("Error fetching user profile:", error);
            }
          }, 0);
          break;

        case "SIGNED_OUT":
          clearAuth();
          break;

        case "USER_UPDATED":
          console.log("USER_UPDATED", session);
          break;
        default:
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initAuth, setUser, setProfile, clearAuth]);

  return children;
}
