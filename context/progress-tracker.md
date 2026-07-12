# EcoSphere — Progress Tracker

*Update this file after every meaningful implementation change. Keep entries short — this is a
working log, not documentation.*

## Current phase
**Phase 3 Completed — Environmental Pillar (Carbon Transactions ledger, Environmental dashboard with Recharts analytics, and score calculation engine) is fully functional. Ready for Phase 4: Gamification.**

## Done
- [x] PS selected: EcoSphere (over TransitOps, AssetFlow) — see `research/EcoSphere_Deep_Dive_Research.md`
- [x] Competitor teardown, gap analysis, personas, feature ideas, MVP scope completed
- [x] Context files written (`project-overview.md`, `architecture.md`, `ui-context.md`,
      `code-standards.md`, `ai-workflow-rules.md`)
- [x] Phase 1: Scaffold + Auth + App Shell (Vite, React, TypeScript, Tailwind CSS v4, routing, RLS migrations, seed SQL, and shared components)
- [x] Phase 2: Master Data CRUD (Database query wrappers and interactive form dashboards for Departments, Categories, Emission Factors, and ESG weights)
- [x] Phase 3: Environmental Pillar (Carbon Ledger CRUD, auto-calculated CO₂e, Environmental Dashboard with Recharts timeline/scope/benchmarks, and dynamic scores engine)

## In Progress
- [ ] Phase 4: Gamification (Challenges, Participation, XP, Badges, Rewards, Leaderboard)

## Not Started (in build order — see `ai-workflow-rules.md`)
- [ ] Phase 5: ESG Score Gauge (weighted aggregation)
- [ ] Phase 6: AI Emission Classifier
- [ ] Phase 7: Shallow Social + Governance CRUD
- [ ] Phase 8: Stretch features (Score Copilot → NL Report Builder → Recommender → Vision Check)

## Open questions / decisions needed
- *(All resolved: Supabase backend, solo build, Tailwind v4, Gemini API with Ollama fallback)*

## Deviations from plan
*(none yet)*

## Next steps
1. Implement Gamification database query files (`src/lib/db/challenges.ts`, `challengeParticipations.ts`, `rewards.ts`)
2. Create Challenges card catalog and detail view with proof upload form for employees
3. Implement atomic Reward redemption database function/RPC and store catalog UI page (blocking if points or stock insufficient)
4. Implement generic Badge Rule-Evaluator engine (`src/lib/rules/ruleEvaluator.ts`) checks on XP changes and toast rewards
5. Build individual and department XP/score Leaderboard tables
6. Link Phase 4 routes to these page views in `src/App.tsx`



