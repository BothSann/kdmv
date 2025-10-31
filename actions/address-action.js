"use server";

import { isValidCambodiaPhoneNumber, sanitizeName } from "@/lib/utils";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function createAddressAction(customerId, addressData) {
  const cleanFirstName = sanitizeName(addressData.first_name);
  const cleanLastName = sanitizeName(addressData.last_name);

  if (!isValidCambodiaPhoneNumber(addressData.phone_number)) {
    return { error: "Invalid Cambodian telephone number format" };
  }

  const { data, error } = await supabaseAdmin
    .from("customer_addresses")
    .insert({
      customer_id: customerId,
      first_name: cleanFirstName,
      last_name: cleanLastName,
      phone_number: addressData.phone_number,
      street_address: addressData.street_address,
      apartment: addressData.apartment,
      country: addressData.country,
      city_province: addressData.city_province,
      is_default: addressData.is_default,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating address:", error);
    return { error: "Failed to create address" };
  }

  return {
    success: true,
    address: data,
    message: "Address created successfully",
  };
}

export async function deleteAddressAction(addressId) {
  const { error } = await supabaseAdmin
    .from("customer_addresses")
    .delete()
    .eq("id", addressId);

  if (error) {
    console.error("Error deleting address:", error);
    return { error: "Failed to delete address" };
  }

  revalidatePath("/account/address");

  return { success: true, message: "Address deleted successfully" };
}

export async function setDefaultAddressAction(addressId, customerId) {
  const { error } = await supabaseAdmin
    .from("customer_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("customer_id", customerId);

  if (error) {
    console.error("Error setting default address:", error);
    return { error: "Failed to set default address" };
  }

  revalidatePath("/account/address");

  return { success: true, message: "Default address set successfully" };
}
