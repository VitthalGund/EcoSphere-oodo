import { supabase } from '../supabase';
import { CsrActivity, EmployeeParticipation } from '../types';

export const getCsrActivities = async (): Promise<CsrActivity[]> => {
  const { data, error } = await supabase
    .from('csr_activities')
    .select(`
      *,
      categories:category_id(name)
    `)
    .order('date', { ascending: true });

  if (error) throw error;
  
  return (data || []).map((item: any) => ({
    ...item,
    category_name: item.categories?.name || 'CSR'
  }));
};

export const createCsrActivity = async (
  activity: Omit<CsrActivity, 'id' | 'created_at'>
): Promise<CsrActivity> => {
  const { data, error } = await supabase
    .from('csr_activities')
    .insert([activity])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCsrActivity = async (
  id: string,
  activity: Partial<Omit<CsrActivity, 'id' | 'created_at'>>
): Promise<CsrActivity> => {
  const { data, error } = await supabase
    .from('csr_activities')
    .update(activity)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCsrActivity = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('csr_activities')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getCsrParticipations = async (filters?: {
  activityId?: string;
  employeeId?: string;
}): Promise<EmployeeParticipation[]> => {
  let query = supabase
    .from('employee_participations')
    .select(`
      *,
      csr_activities:activity_id(title, date),
      users:employee_id(name)
    `)
    .order('created_at', { ascending: false });

  if (filters?.activityId) {
    query = query.eq('activity_id', filters.activityId);
  }
  if (filters?.employeeId) {
    query = query.eq('employee_id', filters.employeeId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((item: any) => ({
    ...item,
    activity_title: item.csr_activities?.title || 'Unknown Event',
    activity_date: item.csr_activities?.date || '',
    employee_name: item.users?.name || 'Unknown Employee'
  }));
};

export const joinCsrActivity = async (
  activityId: string,
  employeeId: string
): Promise<EmployeeParticipation> => {
  const { data, error } = await supabase
    .from('employee_participations')
    .insert([{
      activity_id: activityId,
      employee_id: employeeId,
      approval_status: 'pending',
      volunteering_hours: 0
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateVolunteerHours = async (
  participationId: string,
  hours: number
): Promise<EmployeeParticipation> => {
  const { data, error } = await supabase
    .from('employee_participations')
    .update({ volunteering_hours: hours })
    .eq('id', participationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const approveCsrParticipation = async (
  participationId: string,
  approverId: string
): Promise<EmployeeParticipation> => {
  const { data, error } = await supabase
    .from('employee_participations')
    .update({
      approval_status: 'approved',
      approved_by: approverId
    })
    .eq('id', participationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const rejectCsrParticipation = async (
  participationId: string,
  approverId: string
): Promise<EmployeeParticipation> => {
  const { data, error } = await supabase
    .from('employee_participations')
    .update({
      approval_status: 'rejected',
      approved_by: approverId
    })
    .eq('id', participationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
