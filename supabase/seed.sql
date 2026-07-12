-- EcoSphere Master Data Seed Script
-- Created: 2026-07-12

-- 1. Seed ESG Configuration (Singleton)
INSERT INTO public.esg_config (id, environmental_weight, social_weight, governance_weight, evidence_required, org_name)
VALUES ('00000000-0000-0000-0000-000000000001', 40, 30, 30, true, 'EcoSphere Corp')
ON CONFLICT (id) DO UPDATE SET
    environmental_weight = EXCLUDED.environmental_weight,
    social_weight = EXCLUDED.social_weight,
    governance_weight = EXCLUDED.governance_weight,
    evidence_required = EXCLUDED.evidence_required,
    org_name = EXCLUDED.org_name;

-- 2. Seed Departments
INSERT INTO public.departments (id, name, code, employee_count, status) VALUES
('d1111111-1111-1111-1111-111111111111', 'Engineering & IT', 'ENG', 120, 'active'),
('d2222222-2222-2222-2222-222222222222', 'Sales & Accounts', 'SAL', 45, 'active'),
('d3333333-3333-3333-3333-333333333333', 'Marketing & Brand', 'MKT', 30, 'active'),
('d4444444-4444-4444-4444-444444444444', 'Operations & Logistics', 'OPS', 85, 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Categories
INSERT INTO public.categories (id, name, type, status) VALUES
('c1111111-1111-1111-1111-111111111111', 'Carbon Reduction', 'challenge', 'active'),
('c2222222-2222-2222-2222-222222222222', 'Eco-Commute', 'challenge', 'active'),
('c3333333-3333-3333-3333-333333333333', 'Waste Minimization', 'challenge', 'active'),
('c4444444-4444-4444-4444-444444444444', 'Community CSR', 'csr_activity', 'active'),
('c5555555-5555-5555-5555-555555555555', 'Education & Learning', 'csr_activity', 'active'),
('c6666666-6666-6666-6666-666666666666', 'Health & Safety', 'csr_activity', 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Emission Factors
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

-- 5. Seed Badges
INSERT INTO public.badges (id, name, description, unlock_rule, icon) VALUES
('b1111111-1111-1111-1111-111111111111', 'First Step', 'Completed your first company challenge', '{"type": "threshold", "metric": "challenges_completed", "operator": ">=", "value": 1}', '🌱'),
('b2222222-2222-2222-2222-222222222222', 'Green Champion', 'Accumulated 500 XP points', '{"type": "threshold", "metric": "xp", "operator": ">=", "value": 500}', '🏆'),
('b3333333-3333-3333-3333-333333333333', 'Eco Warrior', 'Accumulated 1000 XP points', '{"type": "threshold", "metric": "xp", "operator": ">=", "value": 1000}', '⚔️'),
('b4444444-4444-4444-4444-444444444444', 'Challenge Streak', 'Completed 5 challenges', '{"type": "threshold", "metric": "challenges_completed", "operator": ">=", "value": 5}', '🔥'),
('b5555555-5555-5555-5555-555555555555', 'Carbon Cutter', 'Logged 10 carbon transactions', '{"type": "threshold", "metric": "carbon_transactions_logged", "operator": ">=", "value": 10}', '✂️')
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Rewards
INSERT INTO public.rewards (id, name, description, points_required, stock, status) VALUES
('r1111111-1111-1111-1111-111111111111', 'Extra Day Off', 'Get one paid day off for your sustainability efforts', 500, 3, 'active'),
('r2222222-2222-2222-2222-222222222222', 'Eco Swag Box', 'Organic cotton t-shirt, bamboo bottle, and metal straw kit', 200, 10, 'active'),
('r3333333-3333-3333-3333-333333333333', 'Premium Coffee Voucher', 'Free coffee at the local sustainable cafe', 50, 20, 'active'),
('r4444444-4444-4444-4444-444444444444', 'Plant a Tree in Your Name', 'Partner with OneTreePlanted to grow a tree in a deforestation zone', 100, 999, 'active')
ON CONFLICT (id) DO NOTHING;
