import { supabase } from '../supabase';
import { EmissionFactor } from '../types';

export const getEmissionFactors = async (): Promise<EmissionFactor[]> => {
  const { data, error } = await supabase
    .from('emission_factors')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createEmissionFactor = async (factor: Omit<EmissionFactor, 'id' | 'created_at'>): Promise<EmissionFactor> => {
  const { data, error } = await supabase
    .from('emission_factors')
    .insert([factor])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEmissionFactor = async (id: string, factor: Partial<Omit<EmissionFactor, 'id' | 'created_at'>>): Promise<EmissionFactor> => {
  const { data, error } = await supabase
    .from('emission_factors')
    .update(factor)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEmissionFactor = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('emission_factors')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
