"use server";

import { signUpEmployee as signUpEmployeeService } from "@/services/apiAuth";
import supabase from "@/services/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signUpEmployeeAction(formData) {
  const firstName = formData.get("first_name");
  const lastName = formData.get("last_name");
  const email = formData.get("email");
  const password = formData.get("password");

  const authData = await signUpEmployeeService({
    firstName,
    lastName,
    email,
    password,
  });

  if (authData.user) {
    const { error } = await supabase.from("employee_profiles").insert({
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
    });

    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}
