"use server";

import { getCustomerAddresses } from "@/lib/api/addresses";
import { addressSchema } from "@/lib/validations/address";
import { sanitizeName } from "@/lib/utils";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAddressAction(customerId, addressData) {
  try {
    // ========================================
    // STEP 1: VALIDATE WITH ZOD SCHEMA
    // ========================================
    const validation = addressSchema.safeParse(addressData);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      console.error("Address Validation Failed:", {
        field: firstError.path[0],
        message: firstError.message,
      });

      return {
        error: firstError.message,
        field: firstError.path[0],
      };
    }

    // ========================================
    // STEP 2: SANITIZE VALIDATED DATA
    // ========================================
    const validatedData = validation.data;

    const sanitizedData = {
      ...validatedData,
      first_name: sanitizeName(validatedData.first_name),
      last_name: sanitizeName(validatedData.last_name),
      phone_number: validatedData.phone_number.trim(),
      street_address: validatedData.street_address.trim(),
      apartment: validatedData.apartment?.trim() || null,
    };

    // ========================================
    // STEP 3: INSERT TO DATABASE
    // ========================================
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("customer_addresses")
      .insert({
        customer_id: customerId,
        ...sanitizedData,
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
  } catch (err) {
    console.error("Unexpected error in createAddressAction:", err);
    return { error: "An unexpected error occurred while creating address" };
  }
}

export async function updateAddressAction(addressId, customerId, addressData) {
  try {
    // ========================================
    // STEP 1: VALIDATE WITH ZOD SCHEMA
    // ========================================
    const validation = addressSchema.safeParse(addressData);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      console.error("Address Validation Failed:", {
        field: firstError.path[0],
        message: firstError.message,
      });

      return {
        error: firstError.message,
        field: firstError.path[0],
      };
    }

    // ========================================
    // STEP 2: SANITIZE VALIDATED DATA
    // ========================================
    const validatedData = validation.data;

    const sanitizedData = {
      ...validatedData,
      first_name: sanitizeName(validatedData.first_name),
      last_name: sanitizeName(validatedData.last_name),
      phone_number: validatedData.phone_number.trim(),
      street_address: validatedData.street_address.trim(),
      apartment: validatedData.apartment?.trim() || null,
    };

    // ========================================
    // STEP 3: UPDATE DATABASE
    // ========================================
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("customer_addresses")
      .update({
        ...sanitizedData,
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
  } catch (err) {
    console.error("Unexpected error in updateAddressAction:", err);
    return { error: "An unexpected error occurred while updating address" };
  }
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
