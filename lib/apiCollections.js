import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { PER_PAGE } from "@/lib/constants";

export async function getAllCollections({ page = 1, perPage = PER_PAGE } = {}) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  try {
    const { data: collections, error } = await supabaseAdmin
      .from("collections")
      .select("*")
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Collections fetch error:", error);
      return { error: "Failed to fetch collections" };
    }

    return {
      success: true,
      collections,
    };
  } catch (err) {
    console.error("Unexpected error in getAllCollections:", err);
    return { error: "An unexpected error occurred while fetching collections" };
  }
}
