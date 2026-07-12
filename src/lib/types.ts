export type UserRole = "admin" | "department_head" | "employee";

export interface Department {
  id: string;
  name: string;
  code: string;
  head_id: string | null;
  parent_department_id: string | null;
  employee_count: number;
  status: "active" | "inactive";
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  type: "csr_activity" | "challenge";
  status: "active" | "inactive";
  created_at?: string;
}

export interface EmissionFactor {
  id: string;
  name: string;
  category: string; // e.g. Scope 1, Scope 2, Scope 3
  factor_value: number;
  unit: string; // e.g. kgCO2e/kWh
  source: string | null;
  created_at?: string;
}

export interface ProductESGProfile {
  id: string;
  product_name: string;
  esg_notes: string;
  created_at?: string;
}

export interface EnvironmentalGoal {
  id: string;
  department_id: string;
  target_metric: string;
  target_value: number;
  deadline: string;
  status: "active" | "completed" | "missed";
  created_at?: string;
}

export interface ESGPolicy {
  id: string;
  title: string;
  description: string;
  version: string;
  status: "draft" | "published";
  created_at?: string;
  published_at?: string | null;
}

export interface BadgeUnlockRule {
  type: "threshold";
  metric:
    | "xp"
    | "challenges_completed"
    | "carbon_transactions_logged"
    | "csr_activities_completed";
  operator: ">=" | ">" | "==" | "<=";
  value: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlock_rule: BadgeUnlockRule;
  icon: string; // emoji or icon name
  created_at?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  stock: number;
  status: "active" | "inactive";
  created_at?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department_id: string | null;
  xp: number;
  level: number;
  points_balance: number;
  avatar_url: string | null;
  created_at?: string;
}

export interface CarbonTransaction {
  id: string;
  department_id: string;
  emission_factor_id: string;
  source_type: string;
  description: string;
  amount: number;
  co2e: number;
  date: string;
  created_via: "manual" | "ai_classifier";
  created_by: string;
  created_at?: string;
  // Joined fields
  department_name?: string;
  emission_factor_name?: string;
  emission_factor_unit?: string;
  created_by_name?: string;
}

export interface CSRActivity {
  id: string;
  title: string;
  category_id: string;
  department_id: string;
  description: string;
  date: string;
  created_at?: string;
  // Joined
  category_name?: string;
  department_name?: string;
}

export interface EmployeeParticipation {
  id: string;
  employee_id: string;
  activity_id: string;
  proof_url: string | null;
  approval_status: "pending" | "approved" | "rejected";
  points_earned: number;
  completion_date: string | null;
  approved_by: string | null;
  created_at?: string;
  // Joined
  employee_name?: string;
  activity_title?: string;
  activity_date?: string;
  volunteering_hours?: number;
}

export interface Challenge {
  id: string;
  title: string;
  category_id: string;
  description: string;
  xp: number;
  difficulty: "Easy" | "Medium" | "Hard";
  evidence_required: boolean;
  deadline: string;
  status: "draft" | "active" | "under_review" | "completed" | "archived";
  created_by: string;
  created_at?: string;
  // Joined
  category_name?: string;
  participant_count?: number;
}

export interface ChallengeParticipation {
  id: string;
  challenge_id: string;
  employee_id: string;
  progress: number; // 0 to 100
  proof_url: string | null;
  approval_status: "pending" | "approved" | "rejected";
  xp_awarded: number;
  approved_by: string | null;
  created_at?: string;
  // Joined
  employee_name?: string;
  challenge_title?: string;
  challenge_xp?: number;
  challenge_difficulty?: string;
}

export interface PolicyAcknowledgement {
  id: string;
  policy_id: string;
  employee_id: string;
  acknowledged_at: string;
  // Joined
  policy_title?: string;
  employee_name?: string;
}

export interface Audit {
  id: string;
  scope: string;
  date_range: string;
  status: "draft" | "completed" | "archived";
  created_at?: string;
}

export interface ComplianceIssue {
  id: string;
  audit_id: string | null;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  owner_id: string;
  due_date: string;
  status: "open" | "resolved" | "overdue";
  created_at?: string;
  // Joined
  owner_name?: string;
}

export interface DepartmentScore {
  id: string;
  department_id: string;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  total_score: number;
  period: string; // e.g. "2026-07"
  updated_at?: string;
  // Joined
  department_name?: string;
}

export interface ESGConfig {
  id: string;
  environmental_weight: number;
  social_weight: number;
  governance_weight: number;
  evidence_required: boolean;
  org_name: string;
  updated_at?: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  // Joined
  badge_name?: string;
  badge_description?: string;
  badge_icon?: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  redeemed_at: string;
  // Joined
  reward_name?: string;
  reward_points_required?: number;
  user_name?: string;
}
