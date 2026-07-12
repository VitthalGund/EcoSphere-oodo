import { supabase } from '../supabase';
import { Reward, RewardRedemption } from '../types';

export const getRewards = async (): Promise<Reward[]> => {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('points_required', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createReward = async (
  reward: Omit<Reward, 'id' | 'created_at'>
): Promise<Reward> => {
  const { data, error } = await supabase
    .from('rewards')
    .insert([reward])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateReward = async (
  id: string,
  reward: Partial<Omit<Reward, 'id' | 'created_at'>>
): Promise<Reward> => {
  const { data, error } = await supabase
    .from('rewards')
    .update(reward)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteReward = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('rewards')
    .update({ status: 'inactive' })
    .eq('id', id);

  if (error) throw error;
};

export const redeemReward = async (
  userId: string,
  rewardId: string
): Promise<{ success: boolean; error?: string }> => {
  const { data, error } = await supabase.rpc('redeem_reward', {
    p_user_id: userId,
    p_reward_id: rewardId
  });

  if (error) throw error;
  
  if (data && data.success) {
    return { success: true };
  } else {
    return { success: false, error: data?.error || 'Failed to redeem reward' };
  }
};

export const getRewardRedemptions = async (userId?: string): Promise<RewardRedemption[]> => {
  let query = supabase
    .from('reward_redemptions')
    .select(`
      *,
      rewards:reward_id(name, points_required),
      users:user_id(name)
    `)
    .order('redeemed_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((item: any) => ({
    ...item,
    reward_name: item.rewards?.name || 'Unknown Reward',
    reward_points_required: item.rewards?.points_required || 0,
    user_name: item.users?.name || 'Unknown User'
  }));
};
