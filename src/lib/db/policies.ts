import { supabase } from '../supabase';
import { ESGPolicy, PolicyAcknowledgement } from '../types';

export const getPolicies = async (): Promise<ESGPolicy[]> => {
  const { data, error } = await supabase
    .from('esg_policies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createPolicy = async (
  policy: Omit<ESGPolicy, 'id' | 'created_at'>
): Promise<ESGPolicy> => {
  const { data, error } = await supabase
    .from('esg_policies')
    .insert([policy])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePolicy = async (
  id: string,
  policy: Partial<Omit<ESGPolicy, 'id' | 'created_at'>>
): Promise<ESGPolicy> => {
  const { data, error } = await supabase
    .from('esg_policies')
    .update(policy)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePolicy = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('esg_policies')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getPolicyAcknowledgements = async (filters?: {
  policyId?: string;
  employeeId?: string;
}): Promise<PolicyAcknowledgement[]> => {
  let query = supabase
    .from('policy_acknowledgements')
    .select(`
      *,
      esg_policies:policy_id(title),
      users:employee_id(name)
    `)
    .order('acknowledged_at', { ascending: false });

  if (filters?.policyId) {
    query = query.eq('policy_id', filters.policyId);
  }
  if (filters?.employeeId) {
    query = query.eq('employee_id', filters.employeeId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((item: any) => ({
    ...item,
    policy_title: item.esg_policies?.title || 'Unknown Policy',
    employee_name: item.users?.name || 'Unknown Employee'
  }));
};

export const acknowledgePolicy = async (
  policyId: string,
  employeeId: string
): Promise<PolicyAcknowledgement> => {
  const { data, error } = await supabase
    .from('policy_acknowledgements')
    .insert([{
      policy_id: policyId,
      employee_id: employeeId
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
