# Trackdown Bug Audit — Aug 2, 2026

Audit scope: Home, Dealer shifts, Gaming sessions, Stats, History, Train, Dealer Academy, Poker/Blackjack trainers, My Hands, Solver Pro preview, Settings, Developer Mode, PWA shell (code review; Capacitor native files excluded from fixes).

Base commit: `02081ff` (main). Card-visibility WIP left uncommitted on disk.

---

## Fixed

| ID | Severity | Area | Summary | Fix commit |
|----|----------|------|---------|------------|
| BUG-001 | P0 | Developer / Demo | Re-seeding demo data appended duplicate demo shifts/sessions | `c05520d` |
| BUG-002 | P0 | Gaming | Rapid buy-ins used stale `additional_buy_ins` and could drop earlier buy-ins | `1ee4ece` |
| BUG-003 | P0 | Dealer | Concurrent down log/skip/break/sheet saves could overwrite each other (last write wins) | `1ee4ece` |
| BUG-004 | P1 | Stats | Date range chips filtered gaming only; dealer earnings/hours stayed all-time | `1ec632b` |
| BUG-005 | P2 | Dealer | End Shift modal stuck on "Ending…" / "Confirming…" after Supabase error | `5a2cd2e` |
| BUG-006 | P2 | My Hands | Hand builder `played_at` date shifted by timezone (UTC parse of date-only string) | `f3f7162` |
| BUG-007 | P2 | Developer | Home preview override persisted in localStorage after Developer Mode disabled | `ebe5b2b` |

### BUG-001 — Duplicate demo records on re-seed (P0)

**Repro:** Settings → Developer → Seed Demo Data twice.

**Expected:** Same demo dataset (idempotent seed).

**Actual:** Second seed inserted another full set of demo shifts/sessions.

**Component:** `lib/demo-data.ts`

**Fix:** Call `clearDemoData()` before insert in `seedDemoData()`.

---

### BUG-002 — Lost additional buy-ins (P0)

**Repro:** Add buy-in, add another quickly (or from stale tab) before UI refreshes.

**Expected:** Both amounts summed in `additional_buy_ins`.

**Actual:** Second save read stale React state and overwrote the first increment.

**Component:** `components/home/HomeDashboard.tsx`, `components/playing/PlayingSection.tsx`

**Fix:** `appendAdditionalBuyIn()` in `lib/db-mutations.ts` reads current DB value before update.

---

### BUG-003 — Lost down logs on concurrent shift block writes (P0)

**Repro:** Log a down via sheet while simultaneously using Break/Skip on cockpit (or two tabs).

**Expected:** Both block updates preserved.

**Actual:** Whichever Supabase update ran last replaced entire `blocks` JSON from stale array.

**Component:** `components/home/HomeDashboard.tsx`, `components/history/HistoryScreen.tsx`

**Fix:** `updateShiftBlock()` / `replaceShiftBlock()` fetch latest blocks before merge.

---

### BUG-004 — Stats date range ignored for dealer side (P1)

**Repro:** Stats → "This Week" with dealer shifts outside the week.

**Expected:** Dealer earnings, breakdown, and total hours respect selected range.

**Actual:** Gaming stats filtered; dealer stats and combined hours used all completed shifts.

**Component:** `components/stats/StatsScreen.tsx`, `lib/playing.ts` (`shiftInDateRange`)

**Fix:** Filter completed shifts with `shiftInDateRange` before `computeDealingStats`.

**Regression test:** `lib/__tests__/playing.test.ts`

---

### BUG-005 — End shift modal stuck confirming (P2)

**Repro:** End shift → confirm while offline or on Supabase error.

**Expected:** Button re-enabled; user can retry.

**Actual:** `confirming` stayed true forever; modal buttons disabled.

**Component:** `components/EndShiftModal.tsx`

**Fix:** `onConfirm` returns `boolean`; reset confirming when `false`.

---

### BUG-006 — Hand played date timezone shift (P2)

**Repro:** Save hand with played date in Hand Builder (US timezones).

**Expected:** Selected calendar date stored.

**Actual:** `new Date("YYYY-MM-DD")` parsed as UTC midnight → previous local day.

**Component:** `components/train/my-hands/HandBuilderModal.tsx`

**Fix:** Build local noon date from year/month/day parts.

---

### BUG-007 — Developer preview persists after dev mode off (P2)

**Repro:** Enable preview cockpit → disable Developer Mode → refresh.

**Expected:** Real home state.

**Actual:** Preview mode restored from localStorage; mutations blocked with error banner.

**Component:** `components/dev/DeveloperPreviewGuard.tsx`, `app/page.tsx`

**Fix:** Clear preview when `settings.developer_mode` is false.

---

## Known fixed on main (not regressed)

| ID | Summary | Commit |
|----|---------|--------|
| BUG-000 | Blackjack Trainer scenario state sync (useReducer) | `02081ff` |

---

## Open — not fixed this pass

| ID | Severity | Area | Summary | Notes |
|----|----------|------|---------|-------|
| BUG-101 | P2 | Dealer / Gaming | No server-side constraint preventing two active shifts or shift+session; client guards only | Requires DB policy or RPC |
| BUG-102 | P2 | History | `DealingSection` / `HistorySection` legacy components lack preview guards (unused in main nav) | Dead code paths |
| BUG-103 | P3 | Stats | Dealing stats include demo records when demo seeded | Filter `is_demo` in stats optional |
| BUG-104 | P3 | Mobile | Card visibility / safe-area polish in progress on separate branch | WIP uncommitted |
| BUG-105 | P3 | Tooling | `npm run lint` prompts ESLint first-time setup (no eslint config committed) | Pre-existing |
| BUG-106 | P4 | Dealer | Home game stats use gross tips path; settled_amount not reflected in earnings totals | Display nuance |
| BUG-107 | P4 | Train | Speed drill timer does not auto-submit at 0s | UX polish |

---

## Verification

| Check | Result |
|-------|--------|
| `npm test` (vitest) | 21 passed |
| `npm run build` (`/opt/homebrew/bin/node`) | Passed |
| `npm run lint` | Not configured (interactive prompt) |

---

## Test matrix (code review)

| Area | Method | Result |
|------|--------|--------|
| Dealing flows | Code review + block RMW helper | Fixed BUG-003, BUG-005 |
| Gaming flows | Code review + buy-in RMW | Fixed BUG-002 |
| History/Stats | Code review + unit tests | Fixed BUG-004 |
| Train / My Hands | Code review | Fixed BUG-006 |
| Settings/Developer | Code review | Fixed BUG-001, BUG-007 |
| Mobile 320–430px | Not browser-tested (card pass WIP) | BUG-104 open |
