import { supabase } from "../supabase";
import { Department } from "../types";

export const getDepartments = async (): Promise<Department[]> => {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createDepartment = async (
  department: Omit<Department, "id" | "created_at">,
): Promise<Department> => {
  const { data, error } = await supabase
    .from("departments")
    .insert([department])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateDepartment = async (
  id: string,
  department: Partial<Omit<Department, "id" | "created_at">>,
): Promise<Department> => {
  const { data, error } = await supabase
    .from("departments")
    .update(department)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  // Soft delete by setting status to inactive
  const { error } = await supabase
    .from("departments")
    .update({ status: "inactive" })
    .eq("id", id);

  if (error) throw error;
};
