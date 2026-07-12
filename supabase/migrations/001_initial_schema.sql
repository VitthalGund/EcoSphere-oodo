-- EcoSphere Initial Schema Migration
-- Created: 2026-07-12

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments Table
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    head_id UUID, -- Foreign Key to public.users (added after users table is defined)
    parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    employee_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Categories Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('csr_activity', 'challenge')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Emission Factors Table
CREATE TABLE public.emission_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g. Scope 1, Scope 2, Scope 3
    factor_value NUMERIC NOT NULL CHECK (factor_value >= 0),
    unit TEXT NOT NULL, -- e.g. kgCO2e/kWh, kgCO2e/liter
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Product ESG Profiles Table
CREATE TABLE public.product_esg_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    esg_notes TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. ESG Policies Table
CREATE TABLE public.esg_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ
);

-- 6. Badges Table
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    unlock_rule JSONB NOT NULL,
    icon TEXT NOT NULL, -- Emoji or icon identifier
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Rewards Table
CREATE TABLE public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    points_required INT NOT NULL CHECK (points_required >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Public Users Profile Table (Extends Supabase Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'department_head', 'employee')),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),
    level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
    points_balance INT NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add head_id FK constraints to departments now that users table is created
ALTER TABLE public.departments ADD CONSTRAINT fk_departments_head FOREIGN KEY (head_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 9. Environmental Goals Table
CREATE TABLE public.environmental_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    target_metric TEXT NOT NULL,
    target_value NUMERIC NOT NULL CHECK (target_value >= 0),
    deadline DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'missed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Carbon Transactions Table
CREATE TABLE public.carbon_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    emission_factor_id UUID NOT NULL REFERENCES public.emission_factors(id) ON DELETE RESTRICT,
    source_type TEXT NOT NULL, -- e.g. "fleet", "electricity", "flight"
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    co2e NUMERIC NOT NULL CHECK (co2e >= 0), -- calculated amount * factor_value
    date DATE NOT NULL,
    created_via TEXT NOT NULL DEFAULT 'manual' CHECK (created_via IN ('manual', 'ai_classifier')),
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. CSR Activities Table
CREATE TABLE public.csr_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Employee Participations Table (Social CSR)
CREATE TABLE public.employee_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES public.csr_activities(id) ON DELETE CASCADE,
    proof_url TEXT,
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    points_earned INT NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
    completion_date TIMESTAMPTZ,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Challenges Table (Gamification)
CREATE TABLE public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    xp INT NOT NULL CHECK (xp >= 0),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    evidence_required BOOLEAN NOT NULL DEFAULT true,
    deadline DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'under_review', 'completed', 'archived')),
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Challenge Participations Table
CREATE TABLE public.challenge_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    proof_url TEXT,
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    xp_awarded INT NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (challenge_id, employee_id)
);

-- 15. Policy Acknowledgements Table
CREATE TABLE public.policy_acknowledgements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES public.esg_policies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (policy_id, employee_id)
);

-- 16. Audits Table
CREATE TABLE public.audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope TEXT NOT NULL,
    date_range TSTZRANGE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Compliance Issues Table
CREATE TABLE public.compliance_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'overdue')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Department Scores Table
CREATE TABLE public.department_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE, -- NULL means Org-wide score
    environmental_score NUMERIC NOT NULL DEFAULT 0 CHECK (environmental_score >= 0 AND environmental_score <= 100),
    social_score NUMERIC NOT NULL DEFAULT 0 CHECK (social_score >= 0 AND social_score <= 100),
    governance_score NUMERIC NOT NULL DEFAULT 0 CHECK (governance_score >= 0 AND governance_score <= 100),
    total_score NUMERIC NOT NULL DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
    period TEXT NOT NULL, -- e.g. '2026-07'
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (department_id, period)
);

-- 19. ESG Configuration Singleton Table
CREATE TABLE public.esg_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environmental_weight NUMERIC NOT NULL DEFAULT 40 CHECK (environmental_weight >= 0 AND environmental_weight <= 100),
    social_weight NUMERIC NOT NULL DEFAULT 30 CHECK (social_weight >= 0 AND social_weight <= 100),
    governance_weight NUMERIC NOT NULL DEFAULT 30 CHECK (governance_weight >= 0 AND governance_weight <= 100),
    evidence_required BOOLEAN NOT NULL DEFAULT true,
    org_name TEXT NOT NULL DEFAULT 'EcoSphere Corp',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraint: weights must sum to 100
ALTER TABLE public.esg_config ADD CONSTRAINT chk_weights_sum CHECK (environmental_weight + social_weight + governance_weight = 100);

-- 20. User Badges Table (Join table)
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, badge_id)
);

-- 21. Reward Redemptions Table
CREATE TABLE public.reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Triggers to auto-create public user profile on Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_dept_id UUID;
    v_role TEXT;
    v_name TEXT;
BEGIN
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'employee');
    v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    
    IF new.raw_user_meta_data->>'department_id' IS NOT NULL AND new.raw_user_meta_data->>'department_id' != '' THEN
        v_dept_id := (new.raw_user_meta_data->>'department_id')::UUID;
    ELSE
        v_dept_id := NULL;
    END IF;

    INSERT INTO public.users (id, name, email, role, department_id, xp, level, points_balance, avatar_url)
    VALUES (
        new.id,
        v_name,
        new.email,
        v_role,
        v_dept_id,
        0,
        1,
        0,
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: on_auth_user_created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
