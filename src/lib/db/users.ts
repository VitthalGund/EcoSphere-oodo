import { supabase } from "../supabase";
import { UserProfile } from "../types";

export const getUsers = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getUsersByRole = async (role: string): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", role)
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
};
