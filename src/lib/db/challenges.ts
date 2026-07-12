import { supabase } from "../supabase";
import { Challenge } from "../types";

export const getChallenges = async (): Promise<Challenge[]> => {
  const { data, error } = await supabase
    .from("challenges")
    .select(
      `
      *,
      categories:category_id(name)
    `,
    )
    .order("deadline", { ascending: true });

  if (error) throw error;

  return (data || []).map((item: any) => ({
    ...item,
    category_name: item.categories?.name || "Uncategorized",
  }));
};

export const createChallenge = async (
  challenge: Omit<Challenge, "id" | "created_at">,
): Promise<Challenge> => {
  const { data, error } = await supabase
    .from("challenges")
    .insert([challenge])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateChallenge = async (
  id: string,
  challenge: Partial<Omit<Challenge, "id" | "created_at">>,
): Promise<Challenge> => {
  const { data, error } = await supabase
    .from("challenges")
    .update(challenge)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const transitionChallengeStatus = async (
  id: string,
  newStatus: Challenge["status"],
): Promise<Challenge> => {
  const { data, error } = await supabase
    .from("challenges")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
