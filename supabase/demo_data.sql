-- EcoSphere Robust Demo Data Seeding Script (Self-Contained)
-- Paste this script into your Supabase SQL Editor and click 'Run'.

-- =========================================================================
-- 1. DEPENDENCIES SEED (Departments, Categories, Factors, Badges, Rewards)
-- =========================================================================

-- Seed Departments first so that auth.users trigger can assign users to them
INSERT INTO public.departments (id, name, code, employee_count, status) VALUES
('d1111111-1111-1111-1111-111111111111', 'Engineering & IT', 'ENG', 120, 'active'),
('d2222222-2222-2222-2222-222222222222', 'Sales & Accounts', 'SAL', 45, 'active'),
('d3333333-3333-3333-3333-333333333333', 'Marketing & Brand', 'MKT', 30, 'active'),
('d4444444-4444-4444-4444-444444444444', 'Operations & Logistics', 'OPS', 85, 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed ESG Configuration (Singleton)
INSERT INTO public.esg_config (id, environmental_weight, social_weight, governance_weight, evidence_required, org_name)
VALUES ('00000000-0000-0000-0000-000000000001', 40, 30, 30, true, 'EcoSphere Corp')
ON CONFLICT (id) DO UPDATE SET
    environmental_weight = EXCLUDED.environmental_weight,
    social_weight = EXCLUDED.social_weight,
    governance_weight = EXCLUDED.governance_weight,
    evidence_required = EXCLUDED.evidence_required,
    org_name = EXCLUDED.org_name;

-- Seed Categories
INSERT INTO public.categories (id, name, type, status) VALUES
('c1111111-1111-1111-1111-111111111111', 'Carbon Reduction', 'challenge', 'active'),
('c2222222-2222-2222-2222-222222222222', 'Eco-Commute', 'challenge', 'active'),
('c3333333-3333-3333-3333-333333333333', 'Waste Minimization', 'challenge', 'active'),
('c4444444-4444-4444-4444-444444444444', 'Community CSR', 'csr_activity', 'active'),
('c5555555-5555-5555-5555-555555555555', 'Education & Learning', 'csr_activity', 'active'),
('c6666666-6666-6666-6666-666666666666', 'Health & Safety', 'csr_activity', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Emission Factors
INSERT INTO public.emission_factors (id, name, category, factor_value, unit, source) VALUES
('e1111111-1111-1111-1111-111111111111', 'Grid Electricity', 'Scope 2', 0.45, 'kgCO2e/kWh', 'EPA eGRID 2024'),
('e2222222-2222-2222-2222-222222222222', 'Natural Gas', 'Scope 1', 1.88, 'kgCO2e/cubic meter', 'DEFRA 2024'),
('e3333333-3333-3333-3333-333333333333', 'Diesel Fleet Fuel', 'Scope 1', 2.68, 'kgCO2e/liter', 'DEFRA 2024'),
('e4444444-4444-4444-4444-444444444444', 'Short-haul Air Travel', 'Scope 3', 0.15, 'kgCO2e/pkm', 'DEFRA 2024'),
('e5555555-5555-5555-5555-555555555555', 'Long-haul Air Travel', 'Scope 3', 0.19, 'kgCO2e/pkm', 'DEFRA 2024'),
('e6666666-6666-6666-6666-666666666666', 'Office Paper Usage', 'Scope 3', 0.92, 'kg/ream', 'Environmental Paper Network'),
('e7777777-7777-7777-7777-777777777777', 'Water Supply', 'Scope 3', 0.34, 'kgCO2e/cubic meter', 'DEFRA 2024'),
('e8888888-8888-8888-8888-888888888888', 'Municipal Waste (Landfill)', 'Scope 3', 467.0, 'kgCO2e/tonne', 'EPA 2024'),
('e9999999-9999-9999-9999-999999999999', 'Single-Passenger Car Commute', 'Scope 3', 0.17, 'kgCO2e/km', 'EPA 2024'),
('e0000000-0000-0000-0000-000000000000', 'Public Bus Commute', 'Scope 3', 0.05, 'kgCO2e/km', 'EPA 2024')
ON CONFLICT (id) DO NOTHING;

-- Seed Badges
INSERT INTO public.badges (id, name, description, unlock_rule, icon) VALUES
('b1111111-1111-1111-1111-111111111111', 'First Step', 'Completed your first company challenge', '{"type": "threshold", "metric": "challenges_completed", "operator": ">=", "value": 1}', '🌱'),
('b2222222-2222-2222-2222-222222222222', 'Green Champion', 'Accumulated 500 XP points', '{"type": "threshold", "metric": "xp", "operator": ">=", "value": 500}', '🏆'),
('b3333333-3333-3333-3333-333333333333', 'Eco Warrior', 'Accumulated 1000 XP points', '{"type": "threshold", "metric": "xp", "operator": ">=", "value": 1000}', '⚔️'),
('b4444444-4444-4444-4444-444444444444', 'Challenge Streak', 'Completed 5 challenges', '{"type": "threshold", "metric": "challenges_completed", "operator": ">=", "value": 5}', '🔥'),
('b5555555-5555-5555-5555-555555555555', 'Carbon Cutter', 'Logged 10 carbon transactions', '{"type": "threshold", "metric": "carbon_transactions_logged", "operator": ">=", "value": 10}', '✂️')
ON CONFLICT (id) DO NOTHING;

-- Seed Rewards
INSERT INTO public.rewards (id, name, description, points_required, stock, status) VALUES
('91111111-1111-1111-1111-111111111111', 'Extra Day Off', 'Get one paid day off for your sustainability efforts', 500, 3, 'active'),
('92222222-2222-2222-2222-222222222222', 'Eco Swag Box', 'Organic cotton t-shirt, bamboo bottle, and metal straw kit', 200, 10, 'active'),
('93333333-3333-3333-3333-333333333333', 'Premium Coffee Voucher', 'Free coffee at the local sustainable cafe', 50, 20, 'active'),
('94444444-4444-4444-4444-444444444444', 'Plant a Tree in Your Name', 'Partner with OneTreePlanted to grow a tree in a deforestation zone', 100, 999, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert ESG Policies (Governance Pillar)
INSERT INTO public.esg_policies (id, title, description, version, status, published_at) VALUES
('a0000000-1111-1111-1111-111111111111', 'Ethics & Code of Conduct', 'Comprehensive guidelines on company ethical standards, customer relationships, and conflict of interest policies.', '1.0', 'published', now() - interval '30 days'),
('a0000000-2222-2222-2222-222222222222', 'Whistleblower Protection Code', 'Procedures for reporting compliance breaches or illegal operations securely without fear of retaliation.', '1.2', 'published', now() - interval '20 days'),
('a0000000-3333-3333-3333-333333333333', 'Anti-Bribery & Compliance Policy', 'Strict protocols governing institutional gifts, partnerships, and global financial standards audits.', '2.0', 'published', now() - interval '10 days'),
('a0000000-4444-4444-4444-444444444444', 'Supplier Sustainability Standard', 'Mandated code for external logistics partners requiring Scope 3 carbon tracking disclosures.', '1.0', 'published', now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

-- Insert CSR Activities (Social Volunteering)
INSERT INTO public.csr_activities (id, title, category_id, department_id, description, date) VALUES
('c0000000-aaaa-bbbb-cccc-dddddddddd01', 'Urban Reforestation & Planting', 'c4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'Join the operations team in planting 150 local saplings to expand urban forestry and carbon sequestration.', '2026-07-05'),
('c0000000-aaaa-bbbb-cccc-dddddddddd02', 'Sustainability Youth Workshop', 'c5555555-5555-5555-5555-555555555555', 'd1111111-1111-1111-1111-111111111111', 'Volunteer to teach local schools about energy conservation factors, recycling practices, and carbon logs.', '2026-07-12'),
('c0000000-aaaa-bbbb-cccc-dddddddddd03', 'Beach Cleanup Drive', 'c4444444-4444-4444-4444-444444444444', 'd3333333-3333-3333-3333-333333333333', 'Team volunteer drive collecting microplastics, landfill waste, and fishing lines from local coastal borders.', '2026-07-20')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 2. DYNAMIC DEMO DATA SEEDING (Uses actual users generated by app)
-- =========================================================================
DO $$
DECLARE
  v_priya_id UUID;
  v_meera_id UUID;
  v_raj_id UUID;
BEGIN
  SELECT id INTO v_priya_id FROM public.users WHERE email = 'priya@ecosphere.com';
  SELECT id INTO v_meera_id FROM public.users WHERE email = 'meera@ecosphere.com';
  SELECT id INTO v_raj_id FROM public.users WHERE email = 'raj@ecosphere.com';

  IF v_priya_id IS NULL OR v_meera_id IS NULL OR v_raj_id IS NULL THEN
    RAISE NOTICE 'Demo users not fully found. The app will automatically create them when you sign in!';
    RETURN;
  END IF;

  -- Insert Sustainability Challenges (Social/Gamification)
  INSERT INTO public.challenges (id, title, category_id, description, xp, difficulty, evidence_required, deadline, status, created_by) VALUES
  ('b0000000-1111-1111-1111-111111111111', 'Zero Waste Week', 'c3333333-3333-3333-3333-333333333333', 'Avoid all single-use plastics, compost lunch leftovers, and log zero landfill trash for 5 consecutive workdays.', 150, 'Easy', true, '2026-08-01', 'active', v_priya_id),
  ('b0000000-2222-2222-2222-222222222222', 'Active Commuter Challenge', 'c2222222-2222-2222-2222-222222222222', 'Commute to the office using cycling, running, or walking for at least 15 kilometers in a single calendar week.', 300, 'Medium', true, '2026-08-15', 'active', v_priya_id),
  ('b0000000-3333-3333-3333-333333333333', 'Vampire Power Shutdown', 'c1111111-1111-1111-1111-111111111111', 'Unplug all electrical screens, laptop docks, and chargers before leaving the office to prevent passive grid usage.', 100, 'Easy', false, '2026-08-30', 'active', v_meera_id),
  ('b0000000-4444-4444-4444-444444444444', 'Green IT Hardware Audit', 'c1111111-1111-1111-1111-111111111111', 'Run energy efficiency configuration audits on all local department servers and virtual machine containers.', 500, 'Hard', true, '2026-09-01', 'active', v_priya_id)
  ON CONFLICT DO NOTHING;

  -- Insert Carbon Transactions (Environmental Carbon Ledger)
  INSERT INTO public.carbon_transactions (id, department_id, emission_factor_id, source_type, description, amount, co2e, date, created_via, created_by) VALUES
  ('e0000000-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'electricity', 'HQ Main Server Rack Electricity Usage - June 2026', 12500, 5625.00, '2026-06-30', 'manual', v_priya_id),
  ('e0000000-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'natural_gas', 'HQ Heating Natural Gas Utilities - June 2026', 1500, 2820.00, '2026-06-30', 'manual', v_priya_id),
  ('e0000000-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', 'e5555555-5555-5555-5555-555555555555', 'flight', 'Business flight from New York to London (Sales Pitch)', 5500, 1045.00, '2026-07-02', 'manual', v_meera_id),
  ('e0000000-4444-4444-4444-444444444444', 'd2222222-2222-2222-2222-222222222222', 'e6666666-6666-6666-6666-666666666666', 'office_supplies', 'Bulk recycled paper purchase for sales proposals', 200, 184.00, '2026-07-06', 'ai_classifier', v_meera_id),
  ('e0000000-5555-5555-5555-555555555555', 'd4444444-4444-4444-4444-444444444444', 'e3333333-3333-3333-3333-333333333333', 'fleet', 'Logistics Fleet Delivery Vans Diesel Refill', 3400, 9112.00, '2026-07-08', 'manual', v_raj_id),
  ('e0000000-6666-6666-6666-666666666666', 'd4444444-4444-4444-4444-444444444444', 'e8888888-8888-8888-8888-888888888888', 'waste', 'Operations Warehouse municipal waste disposal', 1.8, 840.60, '2026-07-10', 'ai_classifier', v_raj_id)
  ON CONFLICT DO NOTHING;

  -- Insert Policy Acknowledgements (Governance Engagement Audit)
  INSERT INTO public.policy_acknowledgements (id, policy_id, employee_id, acknowledged_at) VALUES
  ('f0000000-1111-1111-1111-111111111111', 'a0000000-1111-1111-1111-111111111111', v_priya_id, now() - interval '25 days'),
  ('f0000000-2222-2222-2222-222222222222', 'a0000000-3333-3333-3333-333333333333', v_priya_id, now() - interval '8 days'),
  ('f0000000-3333-3333-3333-333333333333', 'a0000000-2222-2222-2222-222222222222', v_meera_id, now() - interval '18 days'),
  ('f0000000-4444-4444-4444-444444444444', 'a0000000-4444-4444-4444-444444444444', v_meera_id, now() - interval '3 days'),
  ('f0000000-5555-5555-5555-555555555555', 'a0000000-1111-1111-1111-111111111111', v_raj_id, now() - interval '15 days'),
  ('f0000000-6666-6666-6666-666666666666', 'a0000000-2222-2222-2222-222222222222', v_raj_id, now() - interval '12 days')
  ON CONFLICT DO NOTHING;

  -- Insert Challenge Participations
  INSERT INTO public.challenge_participations (id, challenge_id, employee_id, progress, proof_url, approval_status, xp_awarded, approved_by, created_at) VALUES
  ('f000aaaa-1111-1111-1111-111111111111', 'b0000000-3333-3333-3333-333333333333', v_meera_id, 100, 'Proof of shut down uploaded', 'approved', 100, v_priya_id, now() - interval '6 days'),
  ('f000aaaa-2222-2222-2222-222222222222', 'b0000000-1111-1111-1111-111111111111', v_raj_id, 100, 'Shared a picture of reusable lunch containers used throughout the week.', 'approved', 150, v_meera_id, now() - interval '4 days'),
  ('f000aaaa-3333-3333-3333-333333333333', 'b0000000-2222-2222-2222-222222222222', v_raj_id, 75, 'Biked 12km to the office. 3km remaining.', 'pending', 0, NULL, now() - interval '1 day')
  ON CONFLICT DO NOTHING;

  -- Insert Employee Volunteering Hours
  INSERT INTO public.employee_participations (id, employee_id, activity_id, proof_url, approval_status, points_earned, completion_date, approved_by, created_at) VALUES
  ('f000bbbb-1111-1111-1111-111111111111', v_raj_id, 'c0000000-aaaa-bbbb-cccc-dddddddddd01', 'Volunteered 4 hours. Seeded 5 oak saplings.', 'approved', 100, now() - interval '7 days', v_meera_id, now() - interval '7 days'),
  ('f000bbbb-2222-2222-2222-222222222222', v_meera_id, 'c0000000-aaaa-bbbb-cccc-dddddddddd02', 'Taught local school kids about natural greenhouse gases.', 'approved', 120, now() - interval '1 day', v_priya_id, now() - interval '1 day')
  ON CONFLICT DO NOTHING;

  -- Sync balances
  UPDATE public.users SET xp = 250, level = 1, points_balance = 100 WHERE id = v_raj_id;
  UPDATE public.users SET xp = 220, level = 1, points_balance = 120 WHERE id = v_meera_id;

END $$;
