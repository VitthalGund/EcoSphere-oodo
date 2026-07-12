import { supabase } from '../supabase';
import { Badge, BadgeUnlockRule } from '../types';

export const evaluateBadgeRules = async (userId: string): Promise<Badge[]> => {
  try {
    // 1. Fetch all badges
    const { data: allBadges, error: bError } = await supabase
      .from('badges')
      .select('*');
    if (bError) throw bError;

    // 2. Fetch user's profile to get XP
    const { data: profile, error: uError } = await supabase
      .from('users')
      .select('xp')
      .eq('id', userId)
      .single();
    if (uError) throw uError;
    const userXp = profile?.xp || 0;

    // 3. Query challenges completed
    const { count: completedChallengesCount, error: ccError } = await supabase
      .from('challenge_participations')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', userId)
      .eq('approval_status', 'approved');
    if (ccError) throw ccError;
    const challengesCompleted = completedChallengesCount || 0;

    // 4. Query carbon transactions logged
    const { count: carbonTxCount, error: txError } = await supabase
      .from('carbon_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId);
    if (txError) throw txError;
    const carbonTransactionsLogged = carbonTxCount || 0;

    // 5. Query CSR activities completed
    const { count: completedCsrCount, error: csrError } = await supabase
      .from('employee_participations')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', userId)
      .eq('approval_status', 'approved');
    if (csrError) throw csrError;
    const csrActivitiesCompleted = completedCsrCount || 0;

    // Map metrics for evaluation lookup
    const metricsMap: Record<string, number> = {
      xp: userXp,
      challenges_completed: challengesCompleted,
      carbon_transactions_logged: carbonTransactionsLogged,
      csr_activities_completed: csrActivitiesCompleted
    };

    // 6. Fetch user's already awarded badges
    const { data: userBadges, error: ubError } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);
    if (ubError) throw ubError;
    const awardedBadgeIds = new Set((userBadges || []).map((ub: any) => ub.badge_id));

    // 7. Evaluate rules and compile newly awarded badges
    const newlyAwardedBadges: Badge[] = [];

    for (const badge of (allBadges || [])) {
      if (awardedBadgeIds.has(badge.id)) {
        continue; // Already unlocked
      }

      const rule: BadgeUnlockRule = badge.unlock_rule;
      if (!rule) continue;

      const userVal = metricsMap[rule.metric] || 0;
      const thresholdVal = rule.value;
      let passes = false;

      switch (rule.operator) {
        case '>=':
          passes = userVal >= thresholdVal;
          break;
        case '>':
          passes = userVal > thresholdVal;
          break;
        case '==':
          passes = userVal === thresholdVal;
          break;
        case '<=':
          passes = userVal <= thresholdVal;
          break;
      }

      if (passes) {
        // Award badge in DB
        const { error: awardErr } = await supabase
          .from('user_badges')
          .insert([{
            user_id: userId,
            badge_id: badge.id
          }]);

        if (!awardErr) {
          newlyAwardedBadges.push(badge as Badge);
        } else {
          console.error('Error inserting user badge award:', awardErr);
        }
      }
    }

    return newlyAwardedBadges;
  } catch (err) {
    console.error('Error evaluating badge rules:', err);
    return [];
  }
};
