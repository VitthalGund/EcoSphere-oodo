# EcoSphere — Progress Tracker

*Update this file after every meaningful implementation change. Keep entries short — this is a
working log, not documentation.*

## Current phase
**Not started — planning complete, ready for Phase 1 (Scaffold + Auth)**

## Done
- [x] PS selected: EcoSphere (over TransitOps, AssetFlow) — see `research/EcoSphere_Deep_Dive_Research.md`
- [x] Competitor teardown, gap analysis, personas, feature ideas, MVP scope completed
- [x] Context files written (`project-overview.md`, `architecture.md`, `ui-context.md`,
      `code-standards.md`, `ai-workflow-rules.md`)

## In Progress
- [ ] Phase 1: Scaffold + Auth

## Not Started (in build order — see `ai-workflow-rules.md`)
- [ ] Phase 2: Settings/master data CRUD (Departments, Categories, Emission Factors)
- [ ] Phase 3: Environmental pillar (Carbon Transactions, dashboard chart)
- [ ] Phase 4: Gamification (Challenges, Participation, XP, Badges, Rewards, Leaderboard)
- [ ] Phase 5: ESG Score Gauge (weighted aggregation)
- [ ] Phase 6: AI Emission Classifier
- [ ] Phase 7: Shallow Social + Governance CRUD
- [ ] Phase 8: Stretch features (Score Copilot → NL Report Builder → Recommender → Vision Check)

## Open questions / decisions needed
- Confirm final tech choice: Supabase vs. hand-rolled backend (recommendation: Supabase, for speed)
- Confirm team size/split — how many people, who owns which phase, in parallel or sequential
- Decide how much time to budget per phase out of the 8-hour window (suggest: Phase 1–2 = 1.5h,
  Phase 3–5 = 3.5h, Phase 6 = 1h, Phase 7 = 1h, Phase 8 + testing/polish = 1h)

## Deviations from plan
*(none yet — log here if implementation diverges from `architecture.md` / `project-overview.md`,
and update those files to match)*

## Next steps
1. Set up Supabase project + run schema migration for master data tables (see `architecture.md`)
2. Build auth + RBAC + empty app shell matching `ui-context.md` nav structure
3. Seed demo data early so every subsequent phase can be visually tested against realistic data
