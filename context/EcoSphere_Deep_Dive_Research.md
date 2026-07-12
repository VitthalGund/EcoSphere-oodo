# EcoSphere — Deep-Dive Research Report
*Hackathon build window: 8 hours*

---

## 1. Competitor Teardown

**Key finding from live research:** No product on the market combines ESG/carbon management with real employee gamification in one system of record. ESG platforms (Workiva, Watershed, Sweep, Sphera, SAP Sustainability Control Tower) are finance/compliance-grade and completely ignore employee engagement. Gamification/recognition platforms (Centrical, Bonusly, Esteeme, Spinify) are excellent at points/badges/leaderboards but have zero carbon accounting or governance capability. **This gap is EcoSphere's entire USP** — nobody else is building the ESG-score-as-a-game-you-play-at-work product.

| Solution | Category | Core Features | Pricing/Accessibility | Strengths | Critical Gaps | Hackathon-Kill Score (1–10) |
|---|---|---|---|---|---|---|
| **Workiva** | ESG reporting | Unified data across finance/risk/sustainability, audit-ready disclosures, workflow/version control | Enterprise, quote-only | Financial-grade auditability, huge enterprise trust | No gamification, no employee-facing layer at all, heavy/slow for SMB | 8 |
| **Watershed** | Carbon/climate | Scope 1–3 accounting, supplier engagement, climate program management | Enterprise, quote-only | Best-in-class Scope 3 tooling | Carbon-only focus, no social/governance modules, no engagement layer | 7 |
| **Sweep** | ESG/carbon | Automated data collection, multi-framework disclosure mapping, ERP/HRIS integration | Enterprise | Strong integration story | Same enterprise-only, compliance-first framing; zero gamification | 7 |
| **Metrio** | ESG reporting | Centralized non-financial data, sustainability goal tracking, audit-ready reports | Mid-market/enterprise | Flexible dashboards | Static reporting tool, no daily employee interaction loop | 8 |
| **SAP Sustainability Control Tower** | ESG (ERP-native) | Carbon footprint, ESG KPIs tied to SAP modules | Enterprise, SAP-locked | True ERP-native carbon data | Requires full SAP stack, inaccessible to SMB, no gamification | 6 |
| **Salesforce Net Zero Cloud** | Carbon accounting | Emissions tracking on Salesforce platform | Enterprise, Salesforce-locked | Good UI, CRM-native | Carbon-only, no governance/social pillars, no game mechanics | 7 |
| **Benevity** | CSR/volunteering | Employee giving, volunteering, CSR activity tracking | Enterprise | Best-in-class CSR/volunteering UX | No carbon accounting, no governance, no XP/badge system | 6 |
| **Centrical** | Gamification/engagement | Points, badges, leaderboards, AI coaching, performance dashboards | Enterprise, quote-only | Excellent gamification engine | Zero ESG/sustainability content — totally different domain | 9 |
| **Esteeme / Bonusly / Spinify** | Recognition gamification | Coin/point economy, badges, reward store, leaderboards | SMB-friendly, subscription | Proven, lightweight game mechanics teams love | Generic recognition, not tied to sustainability/compliance data at all | 9 |
| **Manual spreadsheets + email** | Status quo | Excel trackers, emailed CSR proof photos, shared drives | Free | Zero cost, infinitely flexible | No real-time visibility, no automation, no engagement, error-prone | 10 |

**Takeaway:** Every ESG player scores 6–8 on kill-score because they're enterprise/compliance-grade — a hackathon team isn't beating Workiva's auditability. But nobody has combined the two categories, so the "kill" isn't about out-featuring any single competitor — it's about **occupying a white-space category** none of them even attempt.

---

## 2. Gap Analysis — Where the White Space Actually Is

| # | Gap | Why it exists | Who suffers most | Impact if solved | Hackathon feasibility |
|---|---|---|---|---|---|
| 1 | **ESG platforms have no engagement layer** | Vendors are finance/compliance teams building for auditors, not for the shop-floor employee | Sustainability managers who need grassroots participation, not just reports | High — participation is the #1 blocker to real ESG progress | High — this is EcoSphere's core loop by design |
| 2 | **Emission-factor mapping is manual data entry** | No vendor has invested in NLP classification for SMB-scale, messy expense data | SMB sustainability leads without a data team | High — removes the #1 friction point in carbon accounting | High — one LLM prompt + emission factor lookup table |
| 3 | **Gamification tools have no "why it matters" narrative** | Recognition platforms optimize for engagement metrics, not mission-driven behavior | Employees who find generic point systems hollow | Medium — sustainability-tied XP feels meaningful, not gimmicky | High — same badge/XP engine, different subject matter |
| 4 | **Report builders require manual filter-clicking** | Legacy UI paradigm nobody has modernized with LLMs yet | Time-pressed managers who want an answer, not a dashboard to explore | Medium-high — turns 5 minutes of clicking into 5 seconds of typing | Medium — needs a filter-mapping layer over existing data model |
| 5 | **No one explains *why* a score changed** | Dashboards show numbers, not causality | Department heads told to "improve ESG score" with no actionable path | High — actionability is what turns a dashboard into a management tool | Medium — needs a simple diff + LLM summary over score history |
| 6 | **Badge/reward systems are static and generic** | Designing meaningful unlock rules takes product thinting most teams skip | Employees who ignore badges because they feel arbitrary | Medium | High — rules engine already required by spec, just needs good defaults |
| 7 | **CSR proof verification is fully manual** | No vendor uses vision models to pre-check evidence | Approvers drowning in photo verification queues | Medium | Medium — vision-model proof check is a nice bonus, not core |
| 8 | **Governance modules are pure documentation** | Nobody makes compliance feel proactive rather than a checkbox chore | Compliance officers reacting instead of preventing | Medium | Low for 8hrs — good to acknowledge, skip building deeply |

**Prioritized for the build:** Gaps #1, #2, #3, #4, #5 are both highest-impact and most feasible in 8 hours — these map directly to the feature list below.

---

## 3. User Personas

### Persona 1 — Priya, Sustainability Manager (Admin)
- **Daily frustrations:** Chases departments for CSR proof over email; builds ESG slide decks manually every month; can't tell *why* the score moved
- **Goals:** A single source of truth she can screenshot into a board deck; less time spent chasing, more time spent improving
- **Top 5 JTBD:** (1) See real-time org ESG score, (2) launch challenges without engineering help, (3) approve CSR/challenge submissions quickly, (4) generate a report in under a minute, (5) understand score drivers without digging
- **Ignored pain point:** She's evaluated on the score but has zero causal visibility into it — current tools show *what*, never *why*

### Persona 2 — Raj, Employee (Participant)
- **Daily frustrations:** CSR participation feels like unpaid extra work with no visible payoff; doesn't know what challenges exist unless someone emails him
- **Goals:** Easy way to see what challenges are active, low-friction proof submission, visible recognition
- **Top 5 JTBD:** (1) Discover active challenges, (2) join and submit proof in under a minute, (3) track XP/level progress, (4) redeem points for something real, (5) see how he stacks up on the leaderboard
- **Ignored pain point:** Existing CSR tools treat submission as a compliance form, not a rewarding moment — no dopamine hit

### Persona 3 — Meera, Department Head
- **Daily frustrations:** Told to "hit ESG targets" with no department-level breakdown; approves activities in a spreadsheet-adjacent process
- **Goals:** A department scoreboard she can rally her team around; fast approvals
- **Top 5 JTBD:** (1) See her department's score vs. others, (2) approve/reject participation quickly, (3) spot compliance issues before they're overdue, (4) run a department-level challenge, (5) export a department report for her own leadership
- **Ignored pain point:** No tool lets her *compete* department-vs-department, which is the single most motivating lever for a manager

### Persona 4 — Karan, Compliance/Governance Officer
- **Daily frustrations:** Tracks policy acknowledgements and audits in disconnected checklists; overdue compliance issues surface too late
- **Goals:** Proactive flagging, not reactive firefighting
- **Top 5 JTBD:** (1) Publish a policy and track acknowledgement %, (2) log and assign compliance issues with owners/due dates, (3) get notified before something goes overdue, (4) generate a governance report fast, (5) see governance score trend
- **Ignored pain point:** Governance is always the "boring pillar" in existing ESG tools — no one has made it feel connected to the same engaging system as everything else

**Delighters that would make users say "no one's built this yet":**
1. **AI Emission Classifier** — paste a purchase description, get an auto-created carbon transaction, no manual lookup
2. **"Why did our score drop?" Copilot** — one click, plain-English causal explanation
3. **Department vs. Department leaderboard** — turns ESG into inter-team competition, not individual gamification only
4. **Natural-language report builder** — type what you want, get the filtered report instantly

---

## 4. Feature Ideas (8 total)

| # | Feature | Description | Why unique | Tech (hackathon-realistic) | Wow (1–10) | Difficulty |
|---|---|---|---|---|---|---|
| 1 | **AI Emission Classifier** | Paste/type a purchase, expense, or fleet log description → LLM matches it to the closest Emission Factor and drafts the Carbon Transaction for one-click confirm | No ESG tool auto-classifies messy text into emission factors at SMB scale | Claude API (single completion call) + emission factor lookup table | 9 | Medium |
| 2 | **"Why Did My Score Change?" Copilot** | Button on the dashboard that diffs current vs. prior period scores and generates a plain-English explanation with the top 3 contributing transactions/activities | No competitor offers causal explanation, only raw numbers | Claude API summarizing a structured score-delta payload | 9 | Medium |
| 3 | **Natural-Language Report Builder** | Type "governance compliance by department this quarter" → auto-maps to filters (Department/Date/Module) and generates the report | Modernizes the spec's own required Custom Report Builder | Claude API with function-calling to map to filter schema | 8 | Medium |
| 4 | **Department vs. Department Leaderboard** | Aggregates individual XP/challenge completion into a department-level competitive leaderboard, separate from individual leaderboard | Gamification tools do individual-only; ESG tools do department reporting but never as a live competition | Pure aggregation query, no AI needed | 7 | Easy |
| 5 | **Auto Badge & XP Engine** | Rules-based engine: Badge unlock rules evaluated on every XP/challenge-completion event, auto-awarded with a toast notification | Spec-required, but most teams will hardcode a few if/else checks instead of a real rule evaluator | Simple rules JSON + evaluator function | 6 | Easy |
| 6 | **Challenge Proof Vision Check** | On CSR/Challenge proof upload, an image model does a quick sanity check (e.g., "does this look like a planting/cleanup photo?") and flags obviously mismatched uploads for the approver | No competitor pre-screens evidence with vision models | Claude API vision input on the uploaded proof image | 7 | Medium |
| 7 | **Personalized Challenge Recommender** | Suggests 2–3 challenges to an employee based on their department, past participation category, and current leaderboard gap | Recognition tools show the same static challenge list to everyone | Simple heuristic + optional LLM re-ranking | 6 | Easy |
| 8 | **Live ESG Score Gauge with Weighted Breakdown** | Real-time animated gauge showing overall score with the configurable 40/30/30 weighting visualized as contributing segments, clickable to drill into each pillar | Most teams will show a static number; this makes the score composition tangible | Frontend chart (recharts) + weighted aggregation query | 8 | Easy |

### Top 3 "holy shit" features for judges
1. **"Why Did My Score Change?" Copilot** — turns a dashboard into a management tool; no ESG platform, even enterprise ones, does causal explanation well
2. **AI Emission Classifier** — directly solves the #1 real-world friction point (manual emission-factor lookup) that every ESG vendor still makes users do by hand
3. **Department vs. Department Leaderboard** — cheap to build, but it's the single most "I want to use this at my company" moment because it reframes ESG as competitive team sport instead of compliance chore

---

## 5. Prioritization Matrix

| Feature | User Impact | Wow Factor | Feasibility (8h) | Overall | Priority |
|---|---|---|---|---|---|
| Auto Badge & XP Engine | 9 | 6 | 9 | 8.0 | **Must-have** |
| Live ESG Score Gauge | 8 | 8 | 9 | 8.3 | **Must-have** |
| Department Leaderboard | 8 | 7 | 9 | 8.0 | **Must-have** |
| AI Emission Classifier | 9 | 9 | 7 | 8.3 | **Must-have** |
| "Why Did Score Change" Copilot | 8 | 9 | 6 | 7.7 | **Must-have (stretch if time-tight)** |
| Natural-Language Report Builder | 6 | 8 | 6 | 6.7 | Nice-to-have |
| Personalized Challenge Recommender | 6 | 6 | 8 | 6.7 | Nice-to-have |
| Challenge Proof Vision Check | 5 | 7 | 5 | 5.7 | Stretch |

**Core MVP (build first, in this order):**
1. Auth/RBAC + Departments/Categories setup
2. Challenges → Join → Submit Proof → Approve → XP award
3. Auto Badge Engine + Leaderboard (individual + department)
4. Carbon Transactions + Emission Factors + Environmental dashboard (this is your "depth" pillar)
5. Live weighted ESG Score Gauge (Environmental real, Social/Governance can use simplified stub data if time runs out)
6. AI Emission Classifier wired into Carbon Transaction creation

**Stretch (only if MVP is done with time to spare):**
- "Why did our score change" Copilot
- Natural-language report builder
- Governance: Policy + Acknowledgement CRUD (keep shallow)
- Social: CSR Activity CRUD (keep shallow)

**The killer integration/twist:** Make the **AI Emission Classifier feed directly into the Score Gauge and the Copilot** — so the demo narrative is: *paste a purchase → watch the carbon transaction appear → watch the score gauge move live → click the Copilot and it explains exactly what just happened.* That end-to-end causal chain, live in front of judges, is the moment that sells the whole product.

---

## 6. Tech Stack (hackathon-realistic, AI-assisted build)

- **Frontend:** React + Tailwind (component conventions in `context/ui-context.md`)
- **Backend:** Node.js/Express or a BaaS (Supabase) for speed — recommend Supabase for Postgres + Auth + Row-Level Security out of the box, saves 1–2 hours vs. hand-rolled RBAC
- **Database:** Postgres (via Supabase) — matches the Master/Transactional data model directly
- **AI layer:** Claude API (Sonnet) for classifier, copilot explanation, and NL report mapping — single `/v1/messages` completion calls, JSON-structured outputs
- **Charts:** Recharts for score gauge, department leaderboard bars, environmental trend line
- **File/proof upload:** Supabase Storage (or base64 blob for hackathon speed)
- **Auth:** Supabase Auth (email/password + RBAC via `role` column + RLS policies)
- **Deployment:** Vercel (frontend) + Supabase (backend/db) — zero-DevOps path

---

## 7. Judge-Winning Angle

With the least team competition on this PS, EcoSphere's win condition isn't "beat 15 other teams doing the same demo" — it's "be the only team in the room showing an ESG platform that *feels alive*." The Emission Classifier → Score Gauge → Copilot chain is a 90-second live demo that no enterprise ESG vendor (let alone another hackathon team) currently offers as a connected experience.

## 8. Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Scope creep across 4 pillars | Hard-cut Social/Governance to shallow CRUD; go deep only on Environmental + Gamification |
| AI API latency/cost live-demo risk | Pre-seed 2–3 known-good demo inputs tested beforehand; have a cached fallback response if API is slow during judging |
| Badge/XP rule engine turning into spaghetti if-else | Define rules as data (JSON) evaluated by one generic function, not hardcoded per-badge logic |
| Running out of time before Score Gauge works | Build Score Gauge with hardcoded weights first, wire in configurability only if time remains |
| Judges test edge cases (e.g., duplicate reward redemption) | Explicitly test stock-decrement and double-redemption during the last 30 minutes before demo |
