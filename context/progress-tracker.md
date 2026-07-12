# EcoSphere — Progress Tracker

*Update this file after every meaningful implementation change. Keep entries short — this is a
working log, not documentation.*

## Current phase
**Phase 4 Completed — Gamification features (Challenges catalog, Detail participation, atomic Rewards Store redemption, Leaderboards, and dynamic Badge Rules Evaluator) are fully functional. Ready for Phase 5: ESG Score Gauge Centerpiece.**

## Done
- [x] PS selected: EcoSphere (over TransitOps, AssetFlow) — see `research/EcoSphere_Deep_Dive_Research.md`
- [x] Competitor teardown, gap analysis, personas, feature ideas, MVP scope completed
- [x] Context files written (`project-overview.md`, `architecture.md`, `ui-context.md`,
      `code-standards.md`, `ai-workflow-rules.md`)
- [x] Phase 1: Scaffold + Auth + App Shell (Vite, React, TypeScript, Tailwind CSS v4, routing, RLS migrations, seed SQL, and shared components)
- [x] Phase 2: Master Data CRUD (Database query wrappers and interactive form dashboards for Departments, Categories, Emission Factors, and ESG weights)
- [x] Phase 3: Environmental Pillar (Carbon Ledger CRUD, auto-calculated CO₂e, Environmental Dashboard with Recharts timeline/scope/benchmarks, and dynamic scores engine)
- [x] Phase 4: Gamification (Challenges catalog, enrollments, proof submissions, atomic RPC reward claims, XP leaderboards, and generic Badge rule evaluation)

## In Progress
- [ ] Phase 5: ESG Score Gauge (weighted centerpiece donut chart)

## Not Started (in build order — see `ai-workflow-rules.md`)
- [ ] Phase 6: AI Emission Classifier
- [ ] Phase 7: Shallow Social + Governance CRUD
- [ ] Phase 8: Stretch features (Score Copilot → NL Report Builder → Recommender → Vision Check)

## Open questions / decisions needed
- *(All resolved: Supabase backend, solo build, Tailwind v4, Gemini API with Ollama fallback)*

## Deviations from plan
*(none yet)*

## Next steps
1. Build the dashboard centerpiece gauge using Recharts `PieChart` structured as a multi-segment donut gauge.
2. Animate the centerpiece gauge segments and make them clickable to reveal underlying metrics.
3. Integrate the active ESG score computation to pull real department and org-wide totals.
4. Display the composite indicator (e.g. A, B, C grade) dynamically on the home page.




