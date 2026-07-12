import { supabase } from "../supabase";
import { EnvironmentalGoal } from "../types";

export const getEnvironmentalGoals = async (): Promise<EnvironmentalGoal[]> => {
  const { data, error } = await supabase
    .from("environmental_goals")
    .select(
      `
      *,
      departments:department_id(name)
    `,
    )
    .order("deadline", { ascending: true });

  if (error) throw error;

  return (data || []).map((item: any) => ({
    ...item,
    department_name: item.departments?.name || "Unknown Department",
  }));
};

export const createEnvironmentalGoal = async (
  goal: Omit<EnvironmentalGoal, "id" | "created_at">,
): Promise<EnvironmentalGoal> => {
  const { data, error } = await supabase
    .from("environmental_goals")
    .insert([goal])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEnvironmentalGoal = async (
  id: string,
  goal: Partial<Omit<EnvironmentalGoal, "id" | "created_at">>,
): Promise<EnvironmentalGoal> => {
  const { data, error } = await supabase
    .from("environmental_goals")
    .update(goal)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEnvironmentalGoal = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("environmental_goals")
    .delete()
    .eq("id", id);

  if (error) throw error;
};
