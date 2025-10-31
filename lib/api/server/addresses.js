import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

// Get all addresses for a customer
export async function getCustomerAddresses(customerId) {
  const { data, error } = await supabaseAdmin
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false }) // Default first
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer addresses:", error);
    return { error: "Failed to fetch customer addresses" };
  }

  return { success: true, addresses: data };
}

// Get default address
export async function getDefaultAddress(customerId) {
  const { data, error } = await supabaseAdmin
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", customerId)
    .eq("is_default", true)
    .single();

  if (error) {
    console.error("Error fetching default address:", error);
    return { error: "Failed to fetch default address" };
  }

  return { success: true, address: data };
}

// Get single address by ID
export async function getAddressById(customerId, addressId) {
  const { data, error } = await supabaseAdmin
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", customerId)
    .eq("id", addressId)
    .single();

  if (error) {
    console.error("Error fetching address:", error);
    return { error: "Failed to fetch address" };
  }

  return { address: data };
}
