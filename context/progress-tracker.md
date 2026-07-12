# EcoSphere — Progress Tracker

_Update this file after every meaningful implementation change. Keep entries short — this is a
working log, not documentation._

## Current phase

**Phase 7 & 8 Completed — Social & Governance CRUD dashboards and the AI ESG Copilot Advisor stretch feature are fully functional. Ready for Phase 9: Verification Pass & Demo Prep.**

## Done

- [x] PS selected: EcoSphere (over TransitOps, AssetFlow) — see `research/EcoSphere_Deep_Dive_Research.md`
- [x] Competitor teardown, gap analysis, personas, feature ideas, MVP scope completed
- [x] Context files written (`project-overview.md`, `architecture.md`, `ui-context.md`,
      `code-standards.md`, `ai-workflow-rules.md`)
- [x] Phase 1: Scaffold + Auth + App Shell (Vite, React, TypeScript, Tailwind CSS v4, routing, RLS migrations, seed SQL, and shared components)
- [x] Phase 2: Master Data CRUD (Database query wrappers and interactive form dashboards for Departments, Categories, Emission Factors, and ESG weights)
- [x] Phase 3: Environmental Pillar (Carbon Ledger CRUD, auto-calculated CO₂e, Environmental Dashboard with Recharts timeline/scope/benchmarks, and dynamic scores engine)
- [x] Phase 4: Gamification (Challenges catalog, enrollments, proof submissions, atomic RPC reward claims, XP leaderboards, and generic Badge rule evaluation)
- [x] Phase 5: ESG Score Gauge (weighted centerpiece donut chart with segment-click inspector on Home Dashboard)
- [x] Phase 6: AI Emission Classifier (structured classification using Gemini API with local Ollama fallback, featuring audit verification UI)
- [x] Phase 7: Shallow Social + Governance CRUD (CSR activities lists, volunteer log trackers, and compliance policy sign-off ledger)
- [x] Phase 8: Stretch features (AI ESG Advisor Copilot slideover panel detailing score changes and actionable compliance reminders)

## In Progress

- [ ] Phase 9: Verification Pass & Demo Prep

## Not Started (in build order — see `ai-workflow-rules.md`)

- *(all complete)*

## Open questions / decisions needed

- _(All resolved: Supabase backend, solo build, Tailwind v4, Gemini API with Ollama fallback)_

## Deviations from plan

_(none yet)_

## Next steps

1. Execute final type safety build verification pass using `npx tsc --noEmit`.
2. Commit all remaining changes to Git.
3. Finalize walkthrough documentation detailing completed features.
