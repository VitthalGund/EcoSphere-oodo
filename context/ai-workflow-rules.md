# EcoSphere — AI Workflow Rules

_How Claude Code (or any AI pair-programmer) should work through this build_

## Read order (do this before writing any code)

1. `context/project-overview.md` — what we're building and why
2. `context/architecture.md` — data model, invariants, AI integration pattern
3. `context/ui-context.md` — layout, colors, component conventions
4. `context/code-standards.md` — implementation rules
5. `context/progress-tracker.md` — what's already done, what's next

## Build order (do not reorder — each phase produces a demoable checkpoint)

1. **Scaffold + Auth** — Supabase project, schema migration for master data, auth + RBAC, empty
   shell UI matching `ui-context.md` nav structure
2. **Settings/master data CRUD** — Departments, Categories, Emission Factors (minimum viable forms,
   not polished)
3. **Environmental pillar (deep)** — Carbon Transactions CRUD, Emission Factor linkage, Environmental
   dashboard chart
4. **Gamification (deep)** — Challenges CRUD + lifecycle, Challenge Participation + proof upload +
   approval, XP award, Badge rule-evaluator, Rewards + redemption, Leaderboard (individual +
   department)
5. **ESG Score Gauge** — weighted aggregation across pillars, wired to the dashboard
6. **AI Emission Classifier** — backend endpoint + frontend confirm-step UI wired into step 3's
   Carbon Transaction form
7. **Shallow Social + Governance CRUD** — CSR Activity/Participation, Policy/Acknowledgement (basic
   forms only, reuse existing card/table components — do not design new patterns here)
8. **Stretch features** — only start these once steps 1–7 are fully working and manually tested per
   the checklist in `code-standards.md`. Priority order: Score Copilot → NL Report Builder →
   Recommender → Proof Vision Check

## Scoping rules

- If a step is taking meaningfully longer than planned, cut scope within that step (fewer fields,
  simpler UI) rather than skipping ahead to the next step with this one half-broken — a fully
  working narrow slice beats a wide slice full of bugs, every time, for a live judged demo
- Never start a stretch feature before the core loop (Classifier → Score Gauge → Challenge → XP →
  Badge → Leaderboard) is fully working end-to-end and manually tested
- If genuinely out of time, cut in this order: Proof Vision Check → NL Report Builder →
  Recommender → Score Copilot → shallow Governance CRUD → shallow Social CRUD — never cut anything
  from the Core MVP list in `project-overview.md`

## When architecture/scope changes mid-build

If an implementation decision changes something documented in `architecture.md`,
`project-overview.md`, or `code-standards.md` (e.g. you discover the badge rule format needs an
extra field, or you decide to drop a planned entity), **update that file immediately**, in the same
commit as the code change — don't let the docs drift from reality. A stale context file is worse
than no context file because the next session will build on wrong assumptions.

## Progress tracking

After every meaningful change (a build-order step completed, a scope change, a bug found that
changes a plan), update `context/progress-tracker.md`:

- Move the completed item from "In Progress" to "Done"
- Note any deviation from the planned architecture/scope and why
- Update "Next Steps" so the next work session (or teammate) can pick up without re-reading
  everything from scratch

## Demo-safety rules (specific to this being a live judged demo, not just a shipped product)

- Pre-seed the database with realistic demo data (departments, a few challenges, some carbon
  transactions, a near-unlock badge state) so the demo doesn't start from an empty, unconvincing
  screen
- Test the AI Emission Classifier with your actual planned demo input beforehand — don't discover
  during judging that your demo phrase produces a bad classification
- Have a non-AI fallback path for every AI feature (manual entry form still works if the classifier
  endpoint fails) — judges seeing a graceful fallback reads as competence, not weakness
