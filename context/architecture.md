# EcoSphere — Architecture

## Stack
- **Frontend:** React + Tailwind CSS, Recharts for charts/gauges
- **Backend/DB/Auth:** Supabase (Postgres + Auth + Row-Level Security + Storage) — chosen over a
  hand-rolled backend to save build time; RBAC via a `role` column + RLS policies, not a custom
  auth server
- **AI layer:** Anthropic API (Claude), called server-side (Supabase Edge Function or a thin
  Node/Express proxy) — never call the Anthropic API directly from the browser with an exposed key
- **Deployment:** Vercel (frontend) + Supabase (hosted backend)

## System boundaries
- EcoSphere does **not** connect to a real ERP. Purchase/Manufacturing/Expense/Fleet records that
  "auto-generate" Carbon Transactions are **simulated** via a simple form or seed data — the AI
  Emission Classifier takes free-text input standing in for that ERP feed.
- No payment/accounting integration. Acquisition costs, reward "stock," and points are tracked for
  display/ranking only, never tied to real financial transactions.
- Single organization per deployment for the hackathon demo (no multi-tenant org-switching UI).

## Data model (master vs. transactional — mirrors the problem statement exactly)

### Master data
- `departments` (id, name, code, head_id, parent_department_id, employee_count, status)
- `categories` (id, name, type[csr_activity|challenge], status)
- `emission_factors` (id, name, category, factor_value, unit, source)
- `product_esg_profiles` (id, product_name, esg_notes)
- `environmental_goals` (id, department_id, target_metric, target_value, deadline)
- `esg_policies` (id, title, description, version, status)
- `badges` (id, name, description, unlock_rule [JSON], icon)
- `rewards` (id, name, description, points_required, stock, status)

### Transactional data
- `carbon_transactions` (id, department_id, emission_factor_id, source_type, amount, co2e, date,
  created_via[manual|ai_classifier])
- `csr_activities` (id, title, category_id, department_id, description, date)
- `employee_participations` (id, employee_id, activity_id, proof_url, approval_status, points_earned,
  completion_date)
- `challenges` (id, title, category_id, description, xp, difficulty, evidence_required, deadline,
  status[draft|active|under_review|completed|archived])
- `challenge_participations` (id, challenge_id, employee_id, progress, proof_url, approval_status,
  xp_awarded)
- `policy_acknowledgements` (id, policy_id, employee_id, acknowledged_at)
- `audits` (id, scope, date_range, status) — stub only
- `compliance_issues` (id, audit_id, severity, description, owner_id, due_date, status) — stub only
- `department_scores` (id, department_id, environmental_score, social_score, governance_score,
  total_score, period)
- `users` (id, name, email, role[admin|department_head|employee], department_id, xp, level,
  points_balance)

## Invariants (must hold regardless of which screen writes the data)
1. A Badge's `unlock_rule` is evaluated by **one generic rule-evaluator function**, run after every
   XP-changing or challenge-completing event. Never hardcode "if user.xp > 100, award badge X" per
   badge — store the threshold in `unlock_rule` and evaluate generically.
2. Reward redemption is a transaction: decrement `rewards.stock` and `users.points_balance`
   atomically. Reject if `stock <= 0` or `points_balance < points_required`.
3. `department_scores.total_score` is always a weighted function of environmental/social/governance
   scores using the org's configured weights (default 40/30/30). Never store a hand-typed total.
4. Challenge/CSR participation cannot move to `approved` if the org's evidence-requirement toggle is
   on and `proof_url` is null.
5. Carbon Transactions created via the AI Emission Classifier still write to the same
   `carbon_transactions` table as manual ones — `created_via` just tags provenance, it does not
   branch the data model.

## AI integration pattern
- **AI Emission Classifier:** free-text description → Claude API call with the `emission_factors`
  table (id, name, category) passed as context → structured JSON response
  `{ emission_factor_id, confidence, suggested_amount }` → pre-fills the Carbon Transaction form for
  one-click confirm. Never auto-commit without a confirm step.
- **Score Copilot:** structured payload of current vs. prior period `department_scores` +
  contributing transactions → Claude API → plain-English explanation string. Cache/re-use the last
  response per period to avoid redundant calls during a live demo.
- All AI calls go through a single backend endpoint (`/api/ai/classify`, `/api/ai/explain-score`)
  that owns the API key — the frontend never touches it directly.

## Folder structure (suggested)
```
/src
  /components      shared UI (cards, gauges, badges, nav)
  /features
    /environmental
    /social
    /governance
    /gamification
    /dashboard
  /lib              supabase client, ai client, rule-evaluator
  /pages or /routes
/supabase
  /migrations       SQL schema + RLS policies
  /functions        edge functions for AI proxy endpoints
```
