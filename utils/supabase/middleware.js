import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import {
  isPublicRoute,
  isAuthRoute,
  requiresAuth,
  isAdminRoute,
} from "@/lib/routes-config";
import { getUserRole } from "@/lib/api/server/users";

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

  // This code is from supabase official documentation. Modify it to fit your needs.
  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get current pathname
  const pathname = request.nextUrl.pathname;

  // Allow public routes for everyone
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  // Handle auth routes (login, register)
  if (isAuthRoute(pathname)) {
    if (user) {
      // User is logged in but trying to access login/register
      // Redirect to appropriate dashboard
      const url = request.nextUrl.clone();
      url.pathname = "/";

      return NextResponse.redirect(url);
    }

    // Guest accessing login/register → Allow
    return supabaseResponse;
  }

  if (user && isAdminRoute(pathname)) {
    const { role } = await getUserRole(user.id); // ← DATABASE QUERY

    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  // Protected routes requiring authentication
  if (requiresAuth(pathname)) {
    if (!user) {
      // Not authenticated → Redirect to login
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";

      // Add redirect parameter to return after login
      url.searchParams.set("redirect", pathname);

      return NextResponse.redirect(url);
    }

    // User is authenticated → Allow (role check happens in layout)
    return supabaseResponse;
  }

  return supabaseResponse;
}
