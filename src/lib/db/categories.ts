import { supabase } from "../supabase";
import { Category } from "../types";

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createCategory = async (
  category: Omit<Category, "id" | "created_at">,
): Promise<Category> => {
  const { data, error } = await supabase
    .from("categories")
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCategory = async (
  id: string,
  category: Partial<Omit<Category, "id" | "created_at">>,
): Promise<Category> => {
  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  // Soft delete
  const { error } = await supabase
    .from("categories")
    .update({ status: "inactive" })
    .eq("id", id);

  if (error) throw error;
};
