# Chain Privacy Survey

Online questionnaire for multi-hop interpersonal privacy propagation
(`A → B → C → D`). The participant is A, the information owner. B, C and D
are hypothetical people in **one** relationship scenario (described in natural
language, `src/config/study.js`). The information is drawn from a pool of
**18 hypothetical items** (6 categories × 3 items, `INFORMATION_ITEM_POOL`).
Each participant gets 6 items, one from each category, as 6 scenarios.

## Stack

- Frontend: React + Vite
- Backend: Express + JSON files
- Balanced item assignment by randomized blocks (`src/lib/itemAssignment.js`)

## Study mode

In `src/config/study.js`:

```js
export const STUDY_MODE = 'pilot';            // label saved with the data
export const SCENARIOS_PER_PARTICIPANT = 6;    // one item per category
export const INCLUDE_REASONING_PROBES = true;  // open probes + factor ranking
```

- 6 items, one from each category, presented in a random (participant-seeded)
  order. All scenarios use the same B / C / D relationships; each scenario gets
  its own sensitivity, AB / ABC / ABCD ratings, probes, factor ranking and
  realism. Person pages (B / C / D) and the comprehension check are asked once,
  after the first sensitivity rating. 74 screens in total with probes on.
- `STUDY_MODE` is only a label; both modes use the same design.

## Item assignment (balanced randomized blocks)

- A *block* contains all 18 items once, shuffled with a random block seed.
- Blocks are appended to one queue; each new participant takes the next
  queued item(s). When the queue runs out, a new block is created.
- The participant takes, in queue order, items whose category differs from
  those already taken until all 6 categories are covered. Skipped items stay at
  the front of the queue for the next participant, so no item is lost and
  counts stay balanced (every 3 participants use one full 18-item block).
- An item is never given twice to the same participant; categories are never
  shown to participants.
- The assignment is locked: `POST /api/assign-items` returns the saved
  assignment for a known `participant_id` (`reused: true`), and the client
  keeps it in the tab session, so refresh / back never redraws.

### Relationship structure

All five relationships are assigned by the system and only displayed;
participants never choose them (`RELATIONSHIP_FACTORS` / `RELATION_LEVELS` in
`src/config/study.js`):

| Factor | Field | Levels |
|--------|-------|--------|
| A–B | `owner_b_relation_condition` | `stranger` / `friend` / `family` |
| A–C | `owner_c_relation_condition` | same |
| A–D | `owner_d_relation_condition` | same |
| B–C | `bc_relation_condition` | same |
| C–D | `cd_relation_condition` | same |

- Each factor is balanced on its own: randomized blocks of 3 (each level once,
  shuffled) in a separate queue with separate seeds
  (`src/lib/relationshipAssignment.js`). Factor levels are equally frequent,
  factors are independent of each other and of the information item; the
  3⁵ = 243 combinations (`relationship_structure_id`) are not balanced cell by cell.
- One structure per participant; all 6 scenarios share it and only the item
  changes.
- `knows_ab` / `knows_ac` / `knows_ad` / `knows_bc` / `knows_cd` = condition
  `!== "stranger"`, set automatically. Closeness `r_ab` / `r_ac` / `r_ad` (1–7)
  is asked only when A knows the person (`null` for `stranger`); trust in B is
  always asked. B–C / C–D closeness is not asked
  (`r_bc` / `r_cd` stay `null`); use the assigned conditions instead.
- The conditions are the manipulation; `r_ab` / `r_ac` / `r_ad` are the participant's
  perception (manipulation check / exploratory continuous variable).

Storage:

| Path | Content |
|------|---------|
| `data/item_assignment_state.json` | Shared item queue, `blocks_created`, `items_assigned` |
| `data/relationship_assignment_state.json` | Shared relationship-structure queue, `blocks_created`, `structures_assigned` |
| `data/participant_assignments/<participant_id>.json` | Locked items (`assignment_seed`, `assignment_block`, `scenario_index`, `scenario_order`) and locked `relationship` per participant |

Without a backend (demo build) each participant gets a reproducible queue
seeded from `participant_id` + a fixed salt (`assignment_method =
"seeded_participant"`); there is no cross-participant balance in that mode.

## Start

```bash
npm install
cp .env.example .env
npm run dev:full
```

- UI: http://localhost:5173
- API: http://localhost:5002

## Flow

1. Consent → general privacy attitudes (baseline) → background and roles  
2. Information item (intro: "Please imagine that the following information
   describes you…", no category label) → sensitivity
   (`information_sensitivity`). Saved as `information_category` (existing
   info-type code), `information_item_id` (stable, shared by EN / 中文, e.g.
   `financial_account_balance`) and `information_item_text` (the text as
   displayed, in the participant's language)  
3. B / C / D pages show the assigned relationships (A–B; A–C and B–C; A–D and
   C–D). If A knows the person, A rates closeness (`r_ab` / `r_ac` / `r_ad`),
   otherwise it is not asked and stays `null`. The B page also asks trust in B  
4. B knows (`acceptability_ab`) → C knows (`acceptability_abc`) → *reason for C*
   → *B vs. C comparison* → D knows (`acceptability_abcd`) → *reason for D* → *C vs. D comparison* →
   *judgment factors (rank all 7)*  
5. Scenario realism (`scenario_realism`); steps 2, 4, 5 repeat for the other 5
   items, then submit  

Steps in *italics* are reasoning probes. They only exist while
`INCLUDE_REASONING_PROBES = true` in `src/config/study.js`; set it to `false`
to drop them from the flow without affecting the core ratings. All open probes come before
the closed factor ranking, which is asked once per scenario. The primary
judgment basis page was removed; its fields stay empty / `null`.

Pilot conditions are fixed, not randomized: B had no explicit permission to
share further (`permission_condition = "not_authorized"`), and C and D did not
know the information before (`c_prior_knowledge = d_prior_knowledge = false`).
The scenario text states this explicitly (`SCENARIO_NARRATIVE`).

A scenario summary card (the information item, highlighted at the top; roles, the narrative, the full A→B→C→D path with all five relationships
labelled — arrows for A–B / B–C / C–D, dashed brackets for A–C / A–D, full
description on hover / tap, people not yet reached faded, current rating target) sits at the top of
every rating page.

Fields kept for compatibility but no longer shown (always `null`): per-hop
`violation`, `permission`, `perceived_share_probability`, `realism`;
`realism_B`, `realism_BC`, `realism_CD`, `D_already_knows`,
`B_relationship_type`, `C_relationship_type_owner`, `D_relationship_type_owner`,
`r_bc` / `r_cd` (+ `_unsure`); the old overall
page (`overall_*`, `perceived_control`, `cumulative_impact`, `optional_comment`).

Categories (6 × 3 items; codes are internal only): `identity_contact`,
`financial`, `health`, `location_activity`, `relationships_intimate`,
`beliefs_preferences`. Sensitivity comes only from the participant's rating;
items carry no preset sensitivity label.

## Modeling fields

Long CSV has **3 rows per scenario** (one per hop; 18 per participant), with `scenario_index` and `study_mode`:

- `info_type` (categorical)  
- `sensitivity_raw` / `sensitivity_norm` where norm = `(raw − 1) / 6`  
- `hop`, `acceptability`  
- `relationship_owner_recipient_raw` / `_norm` (R_AB / R_AC / R_AD)  

Scenario CSV (`/api/export/scenarios.csv`) has **1 row per scenario** (6 per
participant), one variable per column:
`participant_id`, `scenario_id`, `scenario_index` (draw slot),
`scenario_order` (presentation position), `information_category`,
`information_item_id`, `information_item_text`, `survey_language`,
`information_sensitivity`, `assignment_seed`, `assignment_block`,
`assignment_method`, `study_mode`, `owner_c_relation_condition`,
`owner_d_relation_condition`, `relationship_structure_id`,
`bc_relation_condition`, `cd_relation_condition`, `knows_bc`, `knows_cd`,
`owner_c/owner_d/bc/cd_relation_seed`, `relationship_assignment_method`, `knows_ab/ac/ad`, `r_ab/ac/ad/bc/cd` (+ `r_bc_unsure`, `r_cd_unsure`),
`permission_condition`, `c_prior_knowledge`, `d_prior_knowledge`,
`acceptability_ab/abc/abcd`, the four open reasons (C, D, B vs. C, C vs. D),
`judgment_factors` (JSON list, most influential first) plus `factor_rank_*`
(1–7) and `factor_*` (`factor_other` = 1 when the optional
`judgment_factors_other` text is filled), the removed basis columns
(`judgment_basis_ranking`, `basis_rank_*`, `primary_judgment_basis`,
`primary_judgment_basis_other`; empty / `null`), `scenario_realism`, and start/end time per
scenario screen.

Wide and long CSV carry the same relationship-assignment columns; long CSV
also has `owner_recipient_relation_condition` and
`sender_recipient_relation_condition` per hop (for the A→B hop both are the
A–B condition).

`r_ac` / `r_ad` stay `null` in the `stranger` condition (`knows_ac` /
`knows_ad = false`): the closeness item does not apply, which differs from
knowing someone but rating them 1. Derive any network-closeness variable at
analysis time, e.g. `knows_ac === false ? 0 : (r_ac − 1) / 6`.

The 3 self-written baseline items (`privacy_control`, `permission_preference`,
`sharing_comfort`) are no longer shown; their fields and
`general_privacy_concern` (their mean) stay `null`. The attention check is
exported as `attention_check_passed` (selected 4).
`privacy_need_1`–`privacy_need_4` are the informational need-for-privacy items
of the Need for Privacy Scale (Frener, Dombrowski & Trepte, 2024; Chinese
version Wang, Cheng & Zhu, 2024), 5-point agreement; `privacy_need_mean` is
their mean (no reverse items) and is the baseline privacy covariate. The
briefly added DTVP items (`dtvp_1`–`dtvp_3`, `dtvp_mean`) are hidden and stay
`null`. Age and gender are demographic controls.

A comprehension-check page follows the Person D page, right before the first
rating (questions in
`COMPREHENSION_QUESTIONS`, `src/config/surveyQuestions.js`): did A allow B to
share, whom C heard it from, and whether C already knew. Wrong answers show an
explanation and must be corrected before continuing. Exports keep the first
attempt: `comprehension_first_*`, `comprehension_first_*_correct`,
`comprehension_attempts`, `comprehension_passed_first_try`.

Do **not** fit δ / λ, β_bc / β_cd in the frontend; they are estimated afterwards.

## Language (EN / 中文)

- Default English; the pill in the top-right toggles 中文 / English at any point without losing answers.
- The choice is kept per tab (`sessionStorage`), so a new tab starts in English again.
- All participant-facing text lives as `{ en, zh }` objects (config files and a `TEXT` constant per screen); `src/i18n/translate.js` picks the language.
- Stored values stay English codes (e.g. `friend`, `health`); the language at submission is saved as `survey_language` (`en` / `zh`) in both wide and long CSV.

## Export

```bash
curl -H "x-export-token: YOUR_TOKEN" \
  "http://localhost:5002/api/export/long.csv" -o long.csv

curl -H "x-export-token: YOUR_TOKEN" \
  "http://localhost:5002/api/export/scenarios.csv" -o scenarios.csv

curl -H "x-export-token: YOUR_TOKEN" \
  "http://localhost:5002/api/assignment-counts" 
```

`/api/assignment-counts` returns how often each item / category has been
handed out, plus the queue state.

## Data locations

| Path | Content |
|------|---------|
| `data/sessions/*.json` | Participant responses |
| `data/item_assignment_state.json` | Item block queue |
| `data/relationship_assignment_state.json` | Relationship-structure block queue |
| `data/participant_assignments/*.json` | Locked items per participant |

`data/assignment_counts.json` belongs to the old info-type assignment and is
no longer used.

## Demo on GitHub Pages

The static demo build has no backend. Item assignment uses a queue seeded
from the participant ID, responses stay in `localStorage`, and the
completion page offers a JSON download and a restart button.

```bash
VITE_DEMO_MODE=true npm run dev        # try demo mode locally
```

Deployment is automatic via `.github/workflows/deploy-pages.yml` on every push
to `main` (repo Settings → Pages → Source: **GitHub Actions**). The site is
served at `https://<user>.github.io/<repo>/`.

The demo does **not** collect data. For real data collection, deploy the
Express server (`npm run build && npm start`) on a Node host.

## Local retest

Progress is kept per browser tab (`sessionStorage`): refreshing restores the
current step, and opening the survey in a new tab starts a new anonymous
participant. To restart within the same tab:

```js
sessionStorage.removeItem('chain_privacy_survey_session_v4')
location.reload()
```
