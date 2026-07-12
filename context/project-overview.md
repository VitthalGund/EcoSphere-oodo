# EcoSphere — Project Overview

## What we're building
EcoSphere is a gamified ESG (Environmental, Social, Governance) management platform that turns
sustainability compliance into a system employees actually engage with daily — not a quarterly
spreadsheet exercise. It integrates carbon accounting, CSR/challenge participation, governance
compliance, and an XP/badge/leaderboard game layer into one dashboard.

**Hackathon window: 8 hours.** Every decision in this context set is scoped for that constraint.
Depth over breadth: one pillar (Environmental) built well, the rest built shallow-but-real.

## Why this PS, and our USP
Competitive research (see `/research/EcoSphere_Deep_Dive_Research.md`) found no existing product
combines ESG/carbon management with genuine employee gamification. ESG vendors (Workiva, Sweep,
Watershed, SAP) are compliance-grade and ignore engagement. Gamification vendors (Centrical,
Bonusly, Esteeme) ignore sustainability data entirely. EcoSphere sits in that white space.

**One-sentence UVP:** EcoSphere turns your organization's ESG score into a live, explainable,
game you play with your coworkers — not a report someone builds once a quarter.

## Core user loop (this is what the demo must nail)
1. Admin/Manager pastes a purchase/expense description → **AI Emission Classifier** auto-creates
   a Carbon Transaction against the right Emission Factor
2. **Live ESG Score Gauge** updates in real time, showing weighted Environmental/Social/Governance
   contribution
3. Employee joins an active **Challenge**, submits proof, gets approved, earns **XP**
4. **Badge** auto-awards when XP/challenge-count thresholds are hit; **Leaderboard** (individual +
   department) updates
5. Manager clicks **"Why did our score change?" Copilot** → gets a plain-English causal explanation

## In scope for the 8-hour MVP (see `plan/mvp-scope.md` for full breakdown)
- Auth + RBAC (Admin, Employee, Department Head roles minimum)
- Departments & Categories setup
- Environmental pillar (full depth): Emission Factors, Carbon Transactions, AI Emission Classifier
- Gamification (full depth): Challenges, Challenge Participation, XP, Badges (auto-award engine),
  Rewards (redemption), Leaderboard (individual + department)
- Live weighted ESG Score Gauge (Environmental real; Social/Governance may use simplified data)
- Dashboard with KPI cards

## Shallow-but-real (not skipped, just minimal CRUD)
- Social: CSR Activity + Employee Participation (basic create/approve, no deep analytics)
- Governance: ESG Policy + Policy Acknowledgement (basic create/acknowledge)

## Explicitly out of scope for the hackathon build
- Full Custom Report Builder with all 6 filter dimensions (build one working report type instead)
- Diversity Metrics / Training Completion deep analytics
- Full Audit + Compliance Issue workflow (stub only if time remains)
- Multi-tenant/org configuration beyond a single demo organization

## Stretch features (only after MVP is fully working and demo-tested)
1. "Why did our score change?" Copilot
2. Natural-language report builder
3. Personalized challenge recommender
4. Challenge proof vision-check

## Non-negotiable business rules (judges will test these live)
- Badge auto-award must be a real rule evaluator (data-driven rules), not hardcoded per badge
- Reward redemption must decrement stock and block redemption when stock = 0 or points insufficient
- ESG Score = weighted average of pillar scores (default 40/30/30 Environmental/Social/Governance,
  configurable) rolling up Department → Organization
- Challenge lifecycle: Draft → Active → Under Review → Completed, or Archived at any point
- Evidence requirement toggle: when enabled, CSR/Challenge participation cannot be Approved without
  an attached proof file
