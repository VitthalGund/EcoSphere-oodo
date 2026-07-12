import { supabase } from "../supabase";
import { CarbonTransaction } from "../types";

export const getCarbonTransactions = async (filters?: {
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  emissionFactorId?: string;
}): Promise<CarbonTransaction[]> => {
  let query = supabase
    .from("carbon_transactions")
    .select(
      `
      *,
      departments:department_id(name),
      emission_factors:emission_factor_id(name, unit),
      users:created_by(name)
    `,
    )
    .order("date", { ascending: false });

  if (filters?.departmentId && filters.departmentId !== "all") {
    query = query.eq("department_id", filters.departmentId);
  }
  if (filters?.emissionFactorId && filters.emissionFactorId !== "all") {
    query = query.eq("emission_factor_id", filters.emissionFactorId);
  }
  if (filters?.startDate) {
    query = query.gte("date", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("date", filters.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Map database join results back to CarbonTransaction flattened fields
  return (data || []).map((item: any) => ({
    ...item,
    department_name: item.departments?.name || "Unknown Department",
    emission_factor_name: item.emission_factors?.name || "Unknown Factor",
    emission_factor_unit: item.emission_factors?.unit || "",
    created_by_name: item.users?.name || "System / AI",
  }));
};

export const createCarbonTransaction = async (
  transaction: Omit<CarbonTransaction, "id" | "created_at">,
): Promise<CarbonTransaction> => {
  const { data, error } = await supabase
    .from("carbon_transactions")
    .insert([transaction])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCarbonTransaction = async (
  id: string,
  transaction: Partial<Omit<CarbonTransaction, "id" | "created_at">>,
): Promise<CarbonTransaction> => {
  const { data, error } = await supabase
    .from("carbon_transactions")
    .update(transaction)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCarbonTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("carbon_transactions")
    .delete()
    .eq("id", id);

  if (error) throw error;
};
