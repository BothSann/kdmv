import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the current user and their profile
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Define protected routes
  const adminRoutes = ["/admin"];
  const authRoutes = ["/auth/admin/login", "/auth/admin/register"];

  // Check if current path is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If accessing admin routes
  if (isAdminRoute) {
    // No user logged in - redirect to login
    if (!user || userError) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/admin/login";
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // User logged in - check if they have admin role
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        // User doesn't have admin role - redirect to unauthorized
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/auth/admin/login";
        redirectUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/admin/login";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If user is logged in and accessing auth routes, redirect to appropriate dashboard
  if (user && !userError && isAuthRoute) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin/dashboard";
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  }

  return supabaseResponse;
}
