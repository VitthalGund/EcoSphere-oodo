# EcoSphere — Code Standards

These rules exist to keep an 8-hour, AI-assisted build shippable and demoable, not to be a
comprehensive style guide. When in doubt, favor "obviously correct and fast to write" over
"elegant."

## General

- TypeScript for anything nontrivial; plain JS acceptable for quick glue code only if time-pressed
- One feature = one folder under `/src/features/<pillar>` with its own components, hooks, and
  API calls colocated — don't scatter one feature's logic across shared folders
- No premature abstraction: duplicate a small component twice before extracting a shared one;
  extracting too early costs more time than it saves in an 8-hour build

## Data access

- All Supabase queries go through a thin `/src/lib/db/<entity>.ts` module (e.g. `db/challenges.ts`
  exports `getActiveChallenges()`, `createChallenge()`, etc.) — never call `supabase.from(...)`
  directly inside a React component
- Every write that affects `department_scores`, `users.xp`, `users.points_balance`, or
  `rewards.stock` must go through the shared rule-evaluator/scoring functions in `/src/lib/rules/`
  — never mutate these fields inline from a component or one-off handler, or badge/score logic will
  drift and stop matching the invariants in `architecture.md`

## AI calls

- All Claude API calls go through `/src/lib/ai/classify.ts` and `/src/lib/ai/explainScore.ts` —
  never inline a `fetch` to the Anthropic API in a component
- Every AI response that will be shown to the user must be a **confirm-before-commit** step, not
  auto-applied — this is both a UX safety rule and a demo-safety rule (if the AI misclassifies live
  in front of judges, the human-in-the-loop confirm step is the recovery path)
- Wrap every AI call in try/catch with a graceful fallback (e.g. "couldn't auto-classify, enter
  manually") — an AI API hiccup during judging must never blank-screen the app

## State & error handling

- Loading and error states are required on every data-fetching component, even a simple spinner +
  "couldn't load, retry" — half-built loading states are one of the fastest ways to look unfinished
  to judges
- Optimistic UI is fine for XP/badge/leaderboard updates (feels instant, matches the "game" feel)
  but must reconcile with the real server response, not just trust the client

## Testing (scoped for 8 hours — do this, skip everything else)

- Manually test these exact flows before the demo, in this order, and don't skip any:
  1. Create a Carbon Transaction via the AI Classifier end-to-end → confirm it appears in the
     Environmental dashboard and the Score Gauge moves
  2. Join a Challenge → submit proof → approve → confirm XP is awarded and a Badge auto-unlocks if
     the threshold is crossed
  3. Redeem a Reward → confirm stock decrements and a second redemption attempt with insufficient
     points/stock is correctly blocked
  4. Log in as two different roles (Admin, Employee) → confirm each sees the correct scoped view
  5. Refresh the browser mid-flow → confirm no state is lost that shouldn't be (data persisted to
     Supabase, not just local React state)
- No automated test suite is required for the hackathon build — the manual checklist above is the
  bar. If time remains after MVP + stretch features, a handful of Vitest unit tests on the
  rule-evaluator function (`/src/lib/rules/`) is the highest-value place to spend it, since that's
  the invariant most likely to silently break.

## Git / delivery hygiene

- Commit after each working vertical slice (e.g. "Carbon Transaction CRUD works end to end"), not
  after each file — commits should represent demoable checkpoints so you can always roll back to a
  working state under time pressure
- Update `context/progress-tracker.md` at each commit (see `ai-workflow-rules.md`)
