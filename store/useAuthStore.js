import { create } from "zustand";
import { createSupabaseFrontendClient } from "@/utils/supabase/client";
import useCartStore from "./useCartStore";

import {
  getCurrentUserAction,
  loginUserAction,
  logoutUserAction,
} from "@/actions/auth-action";
import { getUserProfileAction } from "@/actions/user-action";

const useAuthStore = create((set, get) => ({
  // 1. User State
  user: null,
  profile: null,
  role: null,
  isLoading: true,

  // 2. User Actions
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile, role: profile?.role || null }),
  setRole: (role) => set({ role }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // 3. Initialize auth with event listeners
  initializeAuth: async () => {
    console.log("Initializing auth...");
    // 1. Get the current user (verified from server)
    // Use getUser() instead of getSession() for security
    // getUser() validates the JWT with the Auth server
    const { user, error } = await getCurrentUserAction();
    // console.log("User from calling getUser() (createServerClient ):", user);

    if (!error && user) {
      set({ user });
      // console.log("User set:", user);
      await get().fetchAndSetUserProfile(user.id);
      await useCartStore.getState().fetchCart();
    } else {
      // No user or error - clear auth and cart
      // This handles logout in other browsers/tabs
      console.log("No authenticated user found, clearing auth and cart");
      get().clearAuth();
    }

    set({ isLoading: false });

    // 2. Set up auth state change listener
    const supabase = createSupabaseFrontendClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case "INITIAL_SESSION":
        case "SIGNED_IN":
          console.log("SIGNED_IN EVENT OCCURRED:", event);

          if (session?.user) {
            set({ user: session.user });

            setTimeout(async () => {
              try {
                const { profile, error } = await getUserProfileAction(
                  session.user.id
                );

                if (!error && profile) {
                  set({ profile, role: profile.role });
                }

                // useCartStore.getState().fetchCart(); // Fire-and-forget (no await)
              } catch (error) {
                console.error("Error fetching user profile:", error);
              }
            }, 0);
          }
          break;

        case "SIGNED_OUT":
          console.log("SIGNED_OUT EVENT OCCURRED");
          get().clearAuth();
          break;

        default:
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  // 3. Fetch User Profile and Role
  fetchAndSetUserProfile: async (userId) => {
    const { profile, error } = await getUserProfileAction(userId);

    if (!error && profile) {
      // console.log("Fetching user profile done, setting profile:", profile);
      set({ profile, role: profile.role });
    } else {
      console.error("Profile fetch error:", error);
    }
  },

  signInUser: async (email, password) => {
    try {
      // 1. Call server action for authentication
      const result = await loginUserAction({ email, password });

      if (result.error) {
        return { error: result.error };
      }

      // 2. Use the user data returned from server action
      if (result.user) {
        set({ user: result.user });
        // Fetch profile immediately with the user ID we already have
        console.log("User is logged in, fetching profile...");
        await get().fetchAndSetUserProfile(result.user.id);

        // 3. Fetch cart immediately after login
        // This is needed because onAuthStateChange won't fire until window focus/tab switch
        console.log("Fetching cart after login...");
        useCartStore.getState().fetchCart(); // Fire-and-forget (no await)

        set({ isLoading: false });
      }

      // 4. Determine redirect based on role
      const profile = get().profile;
      const redirectTo = profile?.role === "admin" ? "/admin/dashboard" : "/";

      return { success: true, message: result.message, redirectTo };
    } catch (err) {
      console.error("Unexpected error:", err);
      return { error: "An unexpected error occurred during sign in" };
    }
  },

  signOutUser: async () => {
    try {
      // 1. Sign out on client first (removes local storage, triggers SIGNED_OUT event)
      const supabase = createSupabaseFrontendClient();
      const { error: clientSignOutError } = await supabase.auth.signOut();

      if (clientSignOutError) {
        console.error("Client sign out error:", clientSignOutError);
        return { error: clientSignOutError.message };
      }

      // 2. Also sign out on server to revoke refresh tokens and clear server cookies
      // This ensures the user is logged out across all devices/sessions
      const result = await logoutUserAction();

      if (result.error) {
        console.error("Server sign out error:", result.error);
        // Continue anyway since client-side is cleared
      }

      // 3. Clear local state (already done by SIGNED_OUT event listener, but be explicit)
      get().clearAuth();

      return { success: true, message: "Logged out successfully!" };
    } catch (err) {
      console.error("Unexpected error:", err);
      return { error: "An unexpected error occurred during logout" };
    }
  },

  // 4. Clear Auth
  clearAuth: () =>
    set({ user: null, profile: null, role: null, isLoading: false }),
}));

export default useAuthStore;
