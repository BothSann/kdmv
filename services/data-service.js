import { notFound } from "next/navigation";
import supabase from "./supabase";

// Get all products
export async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories(name),
      product_variants(quantity)
      `
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.log(error);
    throw new Error("Failed to fetch products");
  }

  const products = data.map((product) => {
    const totalStock =
      product.product_variants?.reduce(
        (sum, variant) => sum + variant.quantity,
        0
      ) || 0;

    return {
      ...product,
      total_stock: totalStock,
      in_stock: totalStock > 0,
    };
  });

  return products;
}

// Get a product by id
export async function getProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.log(error);
    notFound();
  }

  return data;
}

// Create a product
export async function createProduct(newProduct) {
  const { data, error } = await supabase
    .from("products")
    .insert([newProduct])
    .select();

  if (error) {
    console.log(error);
    throw new Error("Failed to create product");
  }

  return data;
}
