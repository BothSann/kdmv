"use server";

import { getCustomerAddresses } from "@/lib/api/server/addresses";
import { isValidCambodiaPhoneNumber, sanitizeName } from "@/lib/utils";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAddressAction(customerId, addressData) {
  const cleanFirstName = sanitizeName(addressData.first_name);
  const cleanLastName = sanitizeName(addressData.last_name);

  console.log("addressData", addressData);
  console.log("phone number", addressData.phone_number);
  if (!isValidCambodiaPhoneNumber(addressData.phone_number)) {
    return { error: "Invalid Cambodian telephone number format" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
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

export async function updateAddressAction(addressId, customerId, addressData) {
  const cleanFirstName = sanitizeName(addressData.first_name);
  const cleanLastName = sanitizeName(addressData.last_name);

  if (!isValidCambodiaPhoneNumber(addressData.phone_number)) {
    return { error: "Invalid Cambodian telephone number format" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customer_addresses")
    .update({
      first_name: cleanFirstName,
      last_name: cleanLastName,
      phone_number: addressData.phone_number,
      street_address: addressData.street_address,
      apartment: addressData.apartment,
      country: addressData.country,
      city_province: addressData.city_province,
      is_default: addressData.is_default,
      updated_at: new Date().toISOString(),
    })
    .eq("id", addressId)
    .eq("customer_id", customerId)
    .select()
    .single();

  if (error) {
    console.error("Error updating address:", error);
    return { error: "Failed to update address" };
  }

  revalidatePath("/account/address");

  return {
    success: true,
    address: data,
    message: "Address updated successfully",
  };
}

export async function deleteAddressAction(addressId, customerId) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", addressId)
    .eq("customer_id", customerId);

  if (error) {
    console.error("Error deleting address:", error);
    return { error: "Failed to delete address" };
  }

  revalidatePath("/account/address");

  return { success: true, message: "Address deleted successfully" };
}

export async function setDefaultAddressAction(addressId, customerId) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
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

export async function getCustomerAddressesAction(customerId) {
  return await getCustomerAddresses(customerId);
}
