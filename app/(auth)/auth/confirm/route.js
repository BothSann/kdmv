import { NextResponse } from "next/server";
import { createProfileForConfirmedUser } from "@/lib/apiAuth";
import { createSupabaseServerClient } from "@/utils/supabase/server";

// Creating a handler to a GET request to route /auth/confirm
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = "/";

  // Create redirect link without the secret token
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (token_hash && type) {
    // Use server client to establish session with cookies
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && data.user) {
      console.log("User confirmed successfully:", data.user);
      // Create profile for confirmed user
      const profileResult = await createProfileForConfirmedUser(data.user);
      console.log("Profile creation result:", profileResult);

      if (profileResult.error) {
        console.error("Profile creation error:", profileResult.error);
        // REDIRECT TO ERROR PAGE WITH CUSTOM MESSAGE
        redirectTo.pathname = "/error";
        redirectTo.searchParams.set("message", profileResult.error);
        return NextResponse.redirect(redirectTo);
      }

      console.log("Redirecting to...:", redirectTo);
      redirectTo.searchParams.delete("next");
      return NextResponse.redirect(redirectTo);
    } else {
      // Auth verification failed
      redirectTo.pathname = "/error";
      redirectTo.searchParams.set(
        "message",
        "Invalid or expired confirmation link"
      );
      return NextResponse.redirect(redirectTo);
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = "/error";
  return NextResponse.redirect(redirectTo);
}
