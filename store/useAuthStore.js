import { create } from "zustand";
import { createSupabaseFrontendClient } from "@/utils/supabase/client";

const supabase = createSupabaseFrontendClient();

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

  initAuth: async () => {
    console.log("Initializing auth...");
    // 1. Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("Session:", session);

    if (!session) {
      console.log("No session found");
      set({ user: null, profile: null, role: null, isLoading: false });
      return;
    }

    //Version 2: Always get the user from the auth getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser();
    set({ user: user });
    await get().fetchUserProfile(user.id);
    set({ isLoading: false });

    //Version 2
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();
    // set({ user: user });

    // if (user) {
    //   await get().fetchUserProfile(user.id);
    //   set({ isLoading: false });
    // } else {
    //   return;
    // }
  },

  // 3. Fetch User Profile and Role
  fetchUserProfile: async (userId) => {
    console.log("Fetching profile for user:", userId);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    console.log("Profile query result:", { profile, profileError });

    if (!profileError && profile) {
      console.log("Setting profile:", profile);
      set({ profile: profile });
      set({ role: profile.role });
    } else {
      console.error("Profile fetch error:", profileError);
    }
  },

  logoutUser: async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        return { error: error.message };
      }

      get().clearAuth();
      return { success: true, message: "Logged out successfully!" };
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  },

  // 4. Clear Auth
  clearAuth: () =>
    set({ user: null, profile: null, role: null, isLoading: false }),
}));

export default useAuthStore;
