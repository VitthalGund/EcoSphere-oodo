# EcoSphere — Progress Tracker

*Update this file after every meaningful implementation change. Keep entries short — this is a
working log, not documentation.*

## Current phase
**Phase 5 Completed — ESG Score Gauge Centerpiece (weighted centerpiece donut gauge with dynamic segment inspection and active ESG index calculations) is fully functional. Ready for Phase 6: AI Emission Classifier.**

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

## In Progress
- [ ] Phase 6: AI Emission Classifier

## Not Started (in build order — see `ai-workflow-rules.md`)
- [ ] Phase 7: Shallow Social + Governance CRUD
- [ ] Phase 8: Stretch features (Score Copilot → NL Report Builder → Recommender → Vision Check)

## Open questions / decisions needed
- *(All resolved: Supabase backend, solo build, Tailwind v4, Gemini API with Ollama fallback)*

## Deviations from plan
*(none yet)*

## Next steps
1. Setup a local mock / Edge Function stub executing semantic matching or Gemini API simulation for classifying purchase descriptions.
2. Build an "AI Assist" import/classification popup on the Carbon Transactions page.
3. Accept raw strings like "Purchased 300 liters of gasoline" and parse them into factor matches (Gasoline factor) and raw amounts (300).
4. Provide a confirm step enabling the user to edit parsed fields before saving to the database ledger.





