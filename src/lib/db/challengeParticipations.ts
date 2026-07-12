import { supabase } from "../supabase";
import { ChallengeParticipation } from "../types";

export const getChallengeParticipations = async (filters?: {
  challengeId?: string;
  employeeId?: string;
  approvalStatus?: ChallengeParticipation["approval_status"];
}): Promise<ChallengeParticipation[]> => {
  let query = supabase
    .from("challenge_participations")
    .select(
      `
      *,
      challenges:challenge_id(title, xp, difficulty),
      users:employee_id(name)
    `,
    )
    .order("created_at", { ascending: false });

  if (filters?.challengeId) {
    query = query.eq("challenge_id", filters.challengeId);
  }
  if (filters?.employeeId) {
    query = query.eq("employee_id", filters.employeeId);
  }
  if (filters?.approvalStatus) {
    query = query.eq("approval_status", filters.approvalStatus);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((item: any) => ({
    ...item,
    challenge_title: item.challenges?.title || "Unknown Challenge",
    challenge_xp: item.challenges?.xp || 0,
    challenge_difficulty: item.challenges?.difficulty || "Medium",
    employee_name: item.users?.name || "Unknown Employee",
  }));
};

export const joinChallenge = async (
  challengeId: string,
  employeeId: string,
): Promise<ChallengeParticipation> => {
  const { data, error } = await supabase
    .from("challenge_participations")
    .insert([
      {
        challenge_id: challengeId,
        employee_id: employeeId,
        progress: 0,
        approval_status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const submitChallengeProof = async (
  participationId: string,
  proofUrl: string,
): Promise<ChallengeParticipation> => {
  const { data, error } = await supabase
    .from("challenge_participations")
    .update({
      proof_url: proofUrl,
      progress: 100,
    })
    .eq("id", participationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const approveChallengeParticipation = async (
  participationId: string,
  challengeId: string,
  employeeId: string,
  xpAwarded: number,
  approverId: string,
): Promise<{ success: boolean; newXp: number; newLevel: number }> => {
  // 1. Update the participation approval status
  const { error: pError } = await supabase
    .from("challenge_participations")
    .update({
      approval_status: "approved",
      xp_awarded: xpAwarded,
      approved_by: approverId,
    })
    .eq("id", participationId);

  if (pError) throw pError;

  // 2. Fetch employee's current points/XP to adjust
  const { data: userProfile, error: uFetchError } = await supabase
    .from("users")
    .select("xp, points_balance")
    .eq("id", employeeId)
    .single();

  if (uFetchError) throw uFetchError;

  const newXp = (userProfile.xp || 0) + xpAwarded;
  const newPoints = (userProfile.points_balance || 0) + xpAwarded;
  const newLevel = Math.floor(newXp / 500) + 1; // 500 XP per level

  // 3. Update the employee's profile
  const { error: uUpdateError } = await supabase
    .from("users")
    .update({
      xp: newXp,
      points_balance: newPoints,
      level: newLevel,
    })
    .eq("id", employeeId);

  if (uUpdateError) throw uUpdateError;

  return { success: true, newXp, newLevel };
};

export const rejectChallengeParticipation = async (
  participationId: string,
  approverId: string,
): Promise<ChallengeParticipation> => {
  const { data, error } = await supabase
    .from("challenge_participations")
    .update({
      approval_status: "rejected",
      approved_by: approverId,
    })
    .eq("id", participationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
