# EcoSphere — 8-Hour Project Plan

## Team split (assumes 3–4 people; adjust proportionally)

- **Person A — Backend/Data:** Supabase schema, RLS/RBAC, rule-evaluator, AI proxy endpoints
- **Person B — Frontend/Gamification:** Challenges, Badges, Rewards, Leaderboard UI
- **Person C — Frontend/Environmental:** Carbon Transactions, Emission Factors, Score Gauge, dashboard
- **Person D (if available) — AI features + Social/Governance shallow CRUD + demo prep/testing**

If only 2 people: A+C pair on backend+environmental, B+D pair on gamification+AI+testing.

## Timeline

| Time      | Phase                                  | Owner(s)       | Deliverable (demoable checkpoint)                                                                                                       |
| --------- | -------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:20 | Kickoff                                | All            | Repo scaffolded, Supabase project created, roles assigned                                                                               |
| 0:20–1:30 | Phase 1: Auth + Shell                  | A + B          | Login works, RBAC roles enforced, sidebar nav shell matches `ui-context.md`                                                             |
| 1:30–2:15 | Phase 2: Master data                   | A + C          | Departments/Categories/Emission Factors CRUD working                                                                                    |
| 2:15–4:00 | Phase 3: Environmental (deep)          | C              | Carbon Transactions CRUD, linked to Emission Factors, Environmental dashboard chart working                                             |
| 2:15–4:00 | Phase 4: Gamification (deep, parallel) | B              | Challenges lifecycle, participation+proof+approval, XP award, Badge auto-award, Rewards redemption, Leaderboard (individual+department) |
| 4:00–4:45 | Phase 5: ESG Score Gauge               | A + C          | Weighted score gauge live on dashboard, pulling real Environmental data                                                                 |
| 4:45–5:45 | Phase 6: AI Emission Classifier        | A + D          | Paste description → auto-drafted Carbon Transaction → confirm → score updates                                                           |
| 5:45–6:30 | Phase 7: Shallow Social + Governance   | D              | CSR Activity + Participation, Policy + Acknowledgement basic CRUD                                                                       |
| 6:30–7:15 | Phase 8: Stretch (time permitting)     | Whoever's free | Score Copilot first, then NL Report Builder                                                                                             |
| 7:15–7:45 | Testing pass                           | All            | Run the 5-flow manual checklist from `code-standards.md` end to end                                                                     |
| 7:45–8:00 | Demo prep                              | All            | Seed final demo data, rehearse demo script once                                                                                         |

**Hard rule:** if Phase 3+4 aren't both done by 4:00, cut Phase 7 (shallow Social/Governance) down
further before cutting anything from Phase 5/6 — the core loop (Environmental + Gamification +
Score Gauge + Classifier) is the entire USP and must not be sacrificed for breadth.

## Demo script (90 seconds, this is the moment that wins the room)

1. Open dashboard — show live ESG Score Gauge and department leaderboard (5s)
2. Go to Carbon Transactions → paste a real purchase description into the AI Classifier → confirm
   the auto-matched emission factor → submit (15s)
3. Cut back to dashboard → Score Gauge visibly updates (10s)
4. Switch to Gamification → show a Challenge, submit proof as an employee, approve as admin, watch
   XP award + Badge unlock toast (25s)
5. Show Department Leaderboard shift (10s)
6. Click "Why did our score change?" Copilot (if built) → read the plain-English explanation aloud
   (15s)
7. Close on the one-sentence UVP: "EcoSphere turns your ESG score into a live game your whole
   company plays — not a report someone builds once a quarter." (10s)

## Success criteria (what "done" means for judging, not for production)

- The 5-flow manual test checklist in `code-standards.md` passes with no crashes
- The demo script above runs live without needing to explain away a broken feature
- At least the 5 "Must-have" features from the prioritization matrix are functional
- No screen in the primary nav is a dead link or obviously placeholder ("coming soon") — better to
  not list a nav item than to show an empty broken screen for it

## Related documents

- `research/EcoSphere_Deep_Dive_Research.md` — full competitive intelligence, personas, gap analysis
- `context/project-overview.md` — product scope
- `context/architecture.md` — data model and system design
- `context/ui-context.md` — visual/UX conventions
- `context/code-standards.md` — implementation and testing rules
- `context/ai-workflow-rules.md` — build order and AI-pair-programming workflow
- `context/progress-tracker.md` — live status, update continuously during the build
