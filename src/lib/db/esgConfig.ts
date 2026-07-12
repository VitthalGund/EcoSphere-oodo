import { supabase } from "../supabase";
import { ESGConfig } from "../types";

export const getESGConfig = async (): Promise<ESGConfig | null> => {
  const { data, error } = await supabase
    .from("esg_config")
    .select("*")
    .limit(1);

  if (error) throw error;
  if (data && data.length > 0) {
    return data[0] as ESGConfig;
  }
  return null;
};

export const updateESGConfig = async (
  id: string,
  config: Partial<Omit<ESGConfig, "id" | "updated_at">>,
): Promise<ESGConfig> => {
  const { data, error } = await supabase
    .from("esg_config")
    .update(config)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createESGConfig = async (
  config: Omit<ESGConfig, "id" | "updated_at">,
): Promise<ESGConfig> => {
  const { data, error } = await supabase
    .from("esg_config")
    .insert([config])
    .select()
    .single();

  if (error) throw error;
  return data;
};
