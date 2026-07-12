-- EcoSphere RLS Policies Migration
-- Created: 2026-07-12

-- Enable Row Level Security on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_esg_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csr_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Security Definer helper function to get user role without recursion
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS text AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. Users Policies
CREATE POLICY "Allow authenticated users to read profiles"
    ON public.users FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow update for self or admin"
    ON public.users FOR UPDATE TO authenticated
    USING (auth.uid() = id OR public.user_role() = 'admin')
    WITH CHECK (auth.uid() = id OR public.user_role() = 'admin');

CREATE POLICY "Allow admin to delete profiles"
    ON public.users FOR DELETE TO authenticated
    USING (public.user_role() = 'admin');

-- 2. Departments Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.departments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage departments"
    ON public.departments FOR ALL TO authenticated
    USING (public.user_role() = 'admin');

-- 3. Categories Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage categories"
    ON public.categories FOR ALL TO authenticated
    USING (public.user_role() = 'admin');

-- 4. Emission Factors Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.emission_factors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage emission factors"
    ON public.emission_factors FOR ALL TO authenticated
    USING (public.user_role() = 'admin');

-- 5. Product ESG Profiles Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.product_esg_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin and managers to manage product profiles"
    ON public.product_esg_profiles FOR ALL TO authenticated
    USING (public.user_role() IN ('admin', 'department_head'));

-- 6. ESG Policies Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.esg_policies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage ESG policies"
    ON public.esg_policies FOR ALL TO authenticated
    USING (public.user_role() = 'admin');

-- 7. Badges Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.badges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage badges"
    ON public.badges FOR ALL TO authenticated
    USING (public.user_role() = 'admin');

-- 8. Rewards Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.rewards FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage rewards"
    ON public.rewards FOR ALL TO authenticated
    USING (public.user_role() = 'admin');

-- 9. Environmental Goals Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.environmental_goals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin and managers to manage goals"
    ON public.environmental_goals FOR ALL TO authenticated
    USING (public.user_role() IN ('admin', 'department_head'));

-- 10. Carbon Transactions Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.carbon_transactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin and managers to manage carbon transactions"
    ON public.carbon_transactions FOR ALL TO authenticated
    USING (public.user_role() IN ('admin', 'department_head'));

-- 11. CSR Activities Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.csr_activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin and managers to manage CSR activities"
    ON public.csr_activities FOR ALL TO authenticated
    USING (public.user_role() IN ('admin', 'department_head'));

-- 12. Employee Participations Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.employee_participations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow employees to join CSR activities"
    ON public.employee_participations FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Allow employees to submit proof or admin/head to approve"
    ON public.employee_participations FOR UPDATE TO authenticated
    USING (auth.uid() = employee_id OR public.user_role() IN ('admin', 'department_head'))
    WITH CHECK (auth.uid() = employee_id OR public.user_role() IN ('admin', 'department_head'));

CREATE POLICY "Allow employee or admin to delete participation"
    ON public.employee_participations FOR DELETE TO authenticated
    USING (auth.uid() = employee_id OR public.user_role() = 'admin');

-- 13. Challenges Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.challenges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage challenges"
    ON public.challenges FOR ALL TO authenticated
    USING (public.user_role() = 'admin');

-- 14. Challenge Participations Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.challenge_participations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow employees to join challenges"
    ON public.challenge_participations FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Allow employees to submit proof or admin/head to approve challenge"
    ON public.challenge_participations FOR UPDATE TO authenticated
    USING (auth.uid() = employee_id OR public.user_role() IN ('admin', 'department_head'))
    WITH CHECK (auth.uid() = employee_id OR public.user_role() IN ('admin', 'department_head'));

CREATE POLICY "Allow employee or admin to delete challenge participation"
    ON public.challenge_participations FOR DELETE TO authenticated
    USING (auth.uid() = employee_id OR public.user_role() = 'admin');

-- 15. Policy Acknowledgements Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.policy_acknowledgements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow employees to acknowledge policies"
    ON public.policy_acknowledgements FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Allow employees to update own acknowledgements"
    ON public.policy_acknowledgements FOR UPDATE TO authenticated
    USING (auth.uid() = employee_id);

-- 16. Audits Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.audits FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage audits"
    ON public.audits FOR ALL TO authenticated
    USING (public.user_role() = 'admin');

-- 17. Compliance Issues Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.compliance_issues FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin and managers to manage compliance issues"
    ON public.compliance_issues FOR ALL TO authenticated
    USING (public.user_role() IN ('admin', 'department_head'));

-- 18. Department Scores Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.department_scores FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage department scores"
    ON public.department_scores FOR ALL TO authenticated
    USING (public.user_role() = 'admin');

-- 19. ESG Config Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.esg_config FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage ESG config"
    ON public.esg_config FOR ALL TO authenticated
    USING (public.user_role() = 'admin');

-- 20. User Badges Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.user_badges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin or user themselves to add badges"
    ON public.user_badges FOR INSERT TO authenticated
    WITH CHECK (public.user_role() = 'admin' OR auth.uid() = user_id);

-- 21. Reward Redemptions Policies
CREATE POLICY "Allow read access for authenticated users"
    ON public.reward_redemptions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to redeem rewards"
    ON public.reward_redemptions FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
