import { supabase } from "../supabase";
import { DepartmentScore, ESGConfig } from "../types";

// Get active ESG config weights
const getWeights = async (): Promise<Omit<ESGConfig, "id" | "updated_at">> => {
  try {
    const { data, error } = await supabase
      .from("esg_config")
      .select("*")
      .limit(1);

    if (error) throw error;
    if (data && data.length > 0) {
      return data[0];
    }
  } catch (e) {
    console.warn("Could not fetch weights, using default 40/30/30 config", e);
  }
  return {
    org_name: "EcoSphere Corp",
    environmental_weight: 40,
    social_weight: 30,
    governance_weight: 30,
    evidence_required: true,
  };
};

export const recalculateDepartmentScore = async (
  departmentId: string | null, // null means organization-wide score
  period: string = "2026-07",
): Promise<DepartmentScore> => {
  // 1. Calculate Environmental Score (based on carbon transactions)
  // Formula: 100 - (total_co2e_kg / 200) clamped 10 - 100
  let envQuery = supabase.from("carbon_transactions").select("co2e");
  if (departmentId) {
    envQuery = envQuery.eq("department_id", departmentId);
  }

  const { data: envData, error: envErr } = await envQuery;
  if (envErr) throw envErr;

  const totalCo2e = (envData || []).reduce(
    (sum, item) => sum + Number(item.co2e),
    0,
  );
  const environmentalScore = Math.max(
    10,
    Math.min(100, Math.round(100 - totalCo2e / 200)),
  );

  // 2. Calculate Social Score (based on CSR activity participations & challenge completions)
  // Formula: (approved_participations / total_participations) * 100
  let socQuery = supabase
    .from("challenge_participations")
    .select("approval_status");
  if (departmentId) {
    // If departmentId is set, join users to filter by department
    const { data: deptUsers } = await supabase
      .from("users")
      .select("id")
      .eq("department_id", departmentId);

    const userIds = (deptUsers || []).map((u) => u.id);
    if (userIds.length > 0) {
      socQuery = socQuery.in("employee_id", userIds);
    } else {
      socQuery = socQuery.eq(
        "employee_id",
        "00000000-0000-0000-0000-000000000000",
      ); // Force empty match
    }
  }

  const { data: socData, error: socErr } = await socQuery;
  if (socErr) throw socErr;

  let socialScore = 80; // Default fallback
  if (socData && socData.length > 0) {
    const approved = socData.filter(
      (item) => item.approval_status === "approved",
    ).length;
    socialScore = Math.round((approved / socData.length) * 100);
  }

  // 3. Calculate Governance Score (based on policy acknowledgements rate)
  // Formula: (acknowledged_policies / total_possible_acknowledgements) * 100
  let govScore = 75; // Default fallback

  const { count: totalPolicies } = await supabase
    .from("esg_policies")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  if (totalPolicies && totalPolicies > 0) {
    let employeesQuery = supabase
      .from("users")
      .select("id", { count: "exact" });
    if (departmentId) {
      employeesQuery = employeesQuery.eq("department_id", departmentId);
    }
    const { count: totalEmployees } = await employeesQuery;

    if (totalEmployees && totalEmployees > 0) {
      const possibleAck = totalPolicies * totalEmployees;

      let ackQuery = supabase
        .from("policy_acknowledgements")
        .select("id", { count: "exact" });
      if (departmentId) {
        const { data: deptUsers } = await supabase
          .from("users")
          .select("id")
          .eq("department_id", departmentId);
        const userIds = (deptUsers || []).map((u) => u.id);
        if (userIds.length > 0) {
          ackQuery = ackQuery.in("employee_id", userIds);
        } else {
          ackQuery = ackQuery.eq(
            "employee_id",
            "00000000-0000-0000-0000-000000000000",
          );
        }
      }

      const { count: ackCount } = await ackQuery;
      if (ackCount !== null) {
        govScore = Math.round((ackCount / possibleAck) * 100);
      }
    }
  }

  // 4. Calculate Weighted Total Score
  const weights = await getWeights();
  const envW = Number(weights.environmental_weight);
  const socW = Number(weights.social_weight);
  const govW = Number(weights.governance_weight);

  const totalScore = Math.round(
    (environmentalScore * envW + socialScore * socW + govScore * govW) / 100,
  );

  // 5. Upsert result into department_scores
  // Note: NULL department_id = org-wide score. PostgreSQL NULL != NULL so we
  // handle the two cases separately to avoid conflict failures.
  let resultData: DepartmentScore | null = null;

  if (departmentId === null) {
    // For org-wide score: delete the existing null-dept row for this period, then insert fresh
    await supabase
      .from("department_scores")
      .delete()
      .is("department_id", null)
      .eq("period", period);

    const { data: insertData, error: insertErr } = await supabase
      .from("department_scores")
      .insert({
        department_id: null,
        environmental_score: environmentalScore,
        social_score: socialScore,
        governance_score: govScore,
        total_score: totalScore,
        period,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (insertErr) throw insertErr;
    resultData = (insertData && insertData[0]) as DepartmentScore;
  } else {
    // For department scores: use onConflict normally (no NULL issue)
    const { data: upsertData, error: upsertErr } = await supabase
      .from("department_scores")
      .upsert(
        {
          department_id: departmentId,
          environmental_score: environmentalScore,
          social_score: socialScore,
          governance_score: govScore,
          total_score: totalScore,
          period,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "department_id,period" },
      )
      .select();

    if (upsertErr) throw upsertErr;
    resultData = (upsertData && upsertData[0]) as DepartmentScore;
  }

  return resultData as DepartmentScore;
};

// Recomputes score for all departments and then the composite organization score
export const recalculateAllScores = async (
  period: string = "2026-07",
): Promise<void> => {
  try {
    // Get all departments
    const { data: depts } = await supabase
      .from("departments")
      .select("id")
      .eq("status", "active");

    // 1. Recalculate each department
    if (depts) {
      for (const dept of depts) {
        await recalculateDepartmentScore(dept.id, period);
      }
    }

    // 2. Recalculate Org-Wide (department_id = null)
    await recalculateDepartmentScore(null, period);
  } catch (err) {
    console.error("Error recalculating scores:", err);
  }
};
