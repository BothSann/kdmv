import supabase from "./supabase";

export async function signUpEmployee({ firstName, lastName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type: "employee",
        first_name: firstName,
        last_name: lastName,
        avatar_url: "",
      },
    },
  });

  if (error) throw new Error(error.message);

  console.log(data);
  return data;
}
