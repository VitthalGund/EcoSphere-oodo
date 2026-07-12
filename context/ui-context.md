# EcoSphere — UI Context

Source: `ecospher_-_8_hours.excalidraw` (v2 wireframe — single sidebar, refined shell)

## Layout shell
- **Single left sidebar navigation** (not icon-rail + tree — the wireframe explicitly rejected the
  double-nav pattern used in an earlier draft). Sections with emoji icons, in this order:
  - 📊 Dashboard
  - 🌱 Environmental (Emission Factors, Product ESG Profiles, Carbon Transactions, Environmental Goals)
  - 👥 Social (CSR Activities, Employee Participation, Diversity Dashboard)
  - 🏛 Governance (Policies, Policy Acknowledgements, Audits, Compliance Issues)
  - 🏆 Gamification (Challenges, Challenge Participation, Badges, Rewards, Leaderboard)
  - 📈 Reports (Environmental/Social/Governance Report, ESG Summary, Custom Report Builder)
  - ⚙ Settings (Departments, Categories, ESG Configuration, Notification Settings)
- Active nav item highlighted; **live counts inline** next to each top-level section (e.g.
  "Environmental 214", "Governance 3", "Gamification 12") — these should be real counts of
  open/active items, not decorative.
- Topbar persists across all screens; only the canvas area changes.

## Sign-in screen
- Split layout: brand/story panel (left) + form (right)
- Brand panel copy: "ESG data, employee action and gamified engagement — in one system of record."
- Brand panel includes a **live stat strip** as social proof before login (e.g. "482.6t CO₂e
  tracked | 78/100 ESG score | 340 employees engaged") — pull real seeded numbers, not placeholders
- Transition on submit: form fades + scales out, app shell fades + lifts in ~400ms later (a nice
  polish detail worth keeping if time allows — cut it first if behind schedule)
- Fields: Work email, Password, Sign in button, Forgot password link

## Color palette (extracted from wireframe)
| Role | Hex | Usage |
|---|---|---|
| Primary / Environmental | `#2f9e44` | Environmental pillar accent, primary CTAs, positive states |
| Governance / links | `#1971c2` | Governance pillar accent, links, info states |
| Warning / accent | `#e8590c` | Alerts, overdue badges, secondary accents |
| Danger | `#e03131` | Overdue/rejected/error states |
| Gamification accent | `#f08c00` | XP, badges, rewards, streak indicators |
| Secondary accent | `#6741d9` | Gamification highlights, level-up moments |
| Text (primary) | `#343a40` | Body text, headings |
| Text (secondary) | `#495057` | Muted labels, captions |
| Border/divider | `#dee2e6` | Card borders, dividers |
| Surface (light) | `#f1f3f5` | Card backgrounds, subtle fills |
| Base | `#ffffff` | Page background, card surfaces |

**Convention:** each ESG pillar keeps its own accent color consistently across nav, cards, charts,
and badges — Environmental is always green, Governance always blue, Gamification always
orange/purple. This makes the dashboard scannable at a glance and is an easy visual "we thought
about this" signal for judges.

## Dashboard screen
- KPI stat cards top row (module counts: Environmental / Social / Governance / Gamification with
  inline counts as shown in sidebar)
- **ESG Score Gauge** as the dashboard centerpiece — weighted, clickable segments per pillar
- Recent activity feed (e.g. "Laptop... allocated", "Room B2 booked" pattern from sibling PS —
  for EcoSphere: "Priya submitted proof for Beach Cleanup", "Badge 'Green Champion' unlocked for
  Raj", "Department Sales overtook Marketing on leaderboard")
- Quick actions: "+ New Challenge", "Log Carbon Transaction", "View Reports"

## Component conventions
- Cards: white surface, `#dee2e6` border, rounded corners, subtle shadow — consistent card
  component reused across Dashboard/Environmental/Gamification screens
- Status badges (Draft/Active/Under Review/Completed/Archived, Approved/Rejected/Pending): pill-
  shaped, color-coded per state (green=approved/active, amber=pending, red=rejected/overdue,
  gray=draft/archived)
- Leaderboard: ranked list with avatar, name, department tag, XP total, rank-change indicator
- Badge display: icon + name, unlocked badges in color, locked badges grayed out with progress bar
  toward unlock rule
- Forms: label above field, consistent spacing, primary button uses the relevant pillar's accent
  color (e.g. a Carbon Transaction form's submit button is Environmental green)

## Typography
- Wireframe uses Excalidraw's default font stack (hand-drawn placeholder) — for the real build,
  use a clean sans-serif (Inter or system-ui) as a professional stand-in; keep heading weights
  bold, body regular, captions/labels muted (`#495057`)

## Mobile responsiveness
- Sidebar collapses to a bottom nav or hamburger drawer on small screens; KPI cards stack
  vertically; leaderboard and gauge remain the priority "above the fold" content on mobile
  dashboard view
