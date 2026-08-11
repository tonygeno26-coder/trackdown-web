# Trackdown Beta — User Data Isolation Audit

**Date:** 2026-08-10  
**Branch:** `cursor/beta-data-isolation-audit`  
**Supabase project:** `jjblqnnxmmgdkjntgkkh`  
**Auditor:** Cursor agent (automated + MCP SQL verification)

## Executive summary

Trackdown stores all user-owned data in four Supabase tables. Row Level Security (RLS) enforces `auth.uid() = user_id` on every table. Anonymous auth gives each install a unique user id; legacy rows with `NULL user_id` are invisible under RLS and do not leak to new accounts.

**Verdict:** Beta-ready for data isolation. New users start with empty history, $0 stats, and no demo data unless Developer Mode is enabled.

---

## Tables audited

| Table | `user_id` column | RLS enabled | Policy | Insert trigger |
|-------|------------------|-------------|--------|----------------|
| `shifts` | uuid (nullable; legacy rows NULL) | ✅ | `Users manage own shifts` — FOR ALL, `auth.uid() = user_id` | `set_shifts_user_id` |
| `playing_sessions` | uuid (nullable) | ✅ | `Users manage own playing sessions` | `set_playing_sessions_user_id` |
| `app_settings` | uuid (nullable); unique per user | ✅ | `Users manage own app settings` | `set_app_settings_user_id` |
| `saved_hands` | uuid NOT NULL | ✅ | `Users manage own saved hands` | — (client sets `user_id`) |

### Nested / JSON data (no separate tables)

| Data | Storage | Isolation mechanism |
|------|---------|---------------------|
| Down blocks (tips, table, game per down) | `shifts.blocks` JSONB | Scoped via parent shift `user_id` + RLS |
| Shift settlements | `shifts.settled_status`, `settled_amount` | Same |
| Buy-ins | `playing_sessions.initial_buy_in`, `additional_buy_ins` | Scoped via session `user_id` + RLS |
| Session notes | `playing_sessions.notes` | Same |
| Hand action history | `saved_hands.action_history` JSONB | Scoped via `saved_hands.user_id` + RLS |

### Legacy orphan rows (pre-migration dev data)

MCP query on 2026-08-10:

| Table | Total rows | Rows with `user_id` | Rows with NULL `user_id` |
|-------|-----------|---------------------|--------------------------|
| shifts | 11 | 0 | 11 |
| playing_sessions | 3 | 0 | 3 |
| app_settings | 1 | 0 | 1 |
| saved_hands | 0 | 0 | 0 |

These rows are **invisible** to all authenticated users because RLS requires `auth.uid() = user_id` and `user_id IS NULL` never matches a signed-in uid. **Not deleted** per audit instructions.

---

## RLS policy verification (live Supabase)

Verified via Supabase MCP `execute_sql` on project `jjblqnnxmmgdkjntgkkh`:

```sql
-- RLS enabled on all user tables
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('shifts','playing_sessions','app_settings','saved_hands');
-- Result: rowsecurity = true for all four

-- Policies (one per table, FOR ALL)
SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('shifts','playing_sessions','app_settings','saved_hands');
-- Result: qual = (auth.uid() = user_id), with_check = (auth.uid() = user_id) for each

-- Insert triggers
SELECT tgname, relname FROM pg_trigger ...
-- Result: set_shifts_user_id, set_playing_sessions_user_id, set_app_settings_user_id
```

Migration `user_data_isolation` applied remotely (version `20260811044412`).

---

## Client query scoping

### SELECT — RLS primary; client filters where noted

| Location | Table | Client filter | RLS |
|----------|-------|---------------|-----|
| `app/page.tsx` | shifts, playing_sessions | Relies on RLS | ✅ |
| `lib/settings.ts` `fetchSettings` | app_settings | `.eq("user_id", userId)` | ✅ |
| `lib/hands/storage.ts` `fetchSavedHands` | saved_hands | `.eq("user_id", userId)` | ✅ |
| `lib/demo-data.ts` `countDemoRecords` | shifts, playing_sessions | `.eq("user_id", userId)` | ✅ |

### INSERT — explicit `user_id` + trigger fallback

| Location | Table | `user_id` on insert |
|----------|-------|---------------------|
| `HomeDashboard.tsx` | shifts, playing_sessions | ✅ explicit |
| `lib/settings.ts` `createDefaultSettings` | app_settings | ✅ explicit |
| `lib/hands/storage.ts` `saveHand` | saved_hands | ✅ explicit |
| `lib/demo-data.ts` `seedDemoData` | shifts, playing_sessions | ✅ explicit + `is_demo: true` |

DB triggers auto-set `user_id := auth.uid()` when client omits it (defense in depth).

### UPDATE / DELETE — RLS blocks cross-user even with known IDs

| Location | Operation | Client filter | RLS protects |
|----------|-----------|---------------|--------------|
| `lib/settings.ts` `updateSettings` | UPDATE | `.eq("user_id", userId)` | ✅ |
| `lib/hands/storage.ts` `deleteSavedHand` | DELETE | `.eq("user_id", userId)` | ✅ |
| `lib/db-mutations.ts` | UPDATE blocks/buy-ins | `.eq("id", …)` only | ✅ RLS |
| `HistoryScreen.tsx` | DELETE | `.eq("id", …)` only | ✅ RLS |
| `HomeDashboard.tsx` | UPDATE | `.eq("id", …)` only | ✅ RLS |

**Security test (Account B vs Account A):** With RLS, Account B issuing `SELECT/UPDATE/DELETE … WHERE id = '<A's uuid>'` returns zero rows / no effect because the row fails the `auth.uid() = user_id` check before visibility. This is enforced server-side, not frontend-only.

---

## Demo data isolation

| Requirement | Status |
|-------------|--------|
| Demo only via Developer Mode | ✅ `seedDemoData` only exposed in `DeveloperSettings` |
| Demo flagged `is_demo: true` | ✅ shifts + playing_sessions |
| Stats exclude demo (BUG-103) | ✅ `excludeDemoRecords` in `StatsScreen` |
| Demo scoped to current user | ✅ all demo inserts/deletes filter `user_id` |
| Developer preview UI-only | ✅ `preview-data.ts` uses fake ids (`preview-dealer-shift`); no DB writes |
| Preview cleared when Developer Mode off | ✅ `DeveloperPreviewGuard` |
| Preview cleared on auth user change | ✅ fixed this session — `DeveloperPreviewProvider` + `clearUserLocalState` |

Demo records **do** appear in History for the user who seeded them (intentional for developer testing). Stats always exclude them.

---

## localStorage audit

| Key | Category | Cleared on user change |
|-----|----------|------------------------|
| `trackdown_dev_preview` | Developer | ✅ `DEV_LOCAL_STORAGE_KEYS` |
| `trackdown_dev_solver_pro_preview` | Developer | ✅ |
| `trackdown_training_progress_v1` | User prefs | ✅ `USER_LOCAL_STORAGE_KEYS` |
| `trackdown_adaptive_training_v1` | User prefs | ✅ |
| `trackdown_blackjack_rules_v1` | User prefs | ✅ |
| `trackdown_last_tournament_hourly_rate` | User prefs | ✅ |

Clearing is triggered in `AuthProvider.applyUserChange` when `lastUserId !== nextUserId`.

---

## Three-account isolation test (A / B / C)

### Automated (this session)

- Unit tests in `lib/__tests__/data-isolation.test.ts` verify migration SQL, client insert scoping, demo exclusion, and localStorage separation.
- Supabase MCP confirms live RLS policies and triggers on project `jjblqnnxmmgdkjntgkkh`.

### Manual TestFlight verification (recommended before production)

Perform on three fresh installs (or three sign-out → fresh anonymous sessions via Developer tools):

1. **Account A**
   - Launch app → confirm empty Home, $0 Stats, empty History.
   - Create one dealer shift and one gaming session.
   - Note shift/session UUIDs from Developer diagnostics (or Supabase dashboard as service role).

2. **Account B** (Settings → Developer → disable dev mode if needed; force new session via reinstall or `signOutUser` + relaunch)
   - Confirm empty Home, $0 Stats, empty History.
   - Attempt to fetch Account A shift by id (requires dev console or modified client) → expect empty / permission denied.

3. **Account C**
   - Enable Developer Mode → Seed Demo Data.
   - Confirm demo appears in History but Stats remain $0 (demo excluded).
   - Disable Developer Mode → preview clears.
   - Sign out / new session → confirm demo and preview gone; Account C′ starts clean.

4. **Cross-account**
   - With Account B session, verify Account A shift/session ids are not visible in any tab.

---

## Incorrectly scoped queries

| Issue | Status |
|-------|--------|
| Permissive `"Allow all for anon"` policies | ✅ Fixed — dropped in migration |
| Stats included demo records (BUG-103) | ✅ Fixed — `excludeDemoRecords` |
| Developer preview localStorage persisting across users | ✅ Fixed — auth user change resets preview state + clears keys |
| Settings not reloading on auth user change | ✅ Fixed — `AppSettingsProvider` reloads on `userId` |
| `updateSettings` missing `user_id` filter | ✅ Fixed — `.eq("user_id", userId)` |
| Legacy `PlayingSection` / `DealingSection` inserts without explicit `user_id` | ⚠️ Dead code (not mounted in app); RLS trigger still assigns uid if ever used |

---

## Fixes made this session

1. **`DeveloperPreviewProvider`** — reset preview mode when authenticated user changes (not just clear localStorage).
2. **`AppSettingsContext`** — reload settings when `userId` changes; clear stale settings while auth pending.
3. **`lib/settings.ts` `updateSettings`** — add `.eq("user_id", userId)` defense in depth.
4. **`lib/__tests__/data-isolation.test.ts`** — expanded coverage for RLS migrations, client scoping, BUG-103, localStorage, saved_hands.
5. **`docs/DATA-ISOLATION-AUDIT.md`** — this document.

Prior commits on branch (`bb01030`, `6e55602`): anonymous auth, RLS migration, demo scoping, stats filter, user-storage clearing.

---

## Remaining beta blockers

| Blocker | Severity | Notes |
|---------|----------|-------|
| Manual A/B/C TestFlight run | Low | Automated + MCP verification complete; manual sign-off recommended |
| Legacy NULL `user_id` rows in DB | None | Invisible under RLS; optional cleanup post-beta |
| No automated live RLS integration test | Low | Would require test Supabase credentials in CI |
| History shows demo records for seeding user | None | By design for developer testing; stats exclude demo |

---

## Ready-to-push status

**Tests and build must pass before push.** Do not push until:

- [x] `npm test` passes
- [x] `npm run build` passes
- [x] All isolation gaps in scope addressed
- [ ] User explicitly approves push (per project instructions)

**Push recommendation:** Ready after test/build green and manual TestFlight spot-check (optional but recommended).

---

## Verification Results

**Date:** 2026-08-11  
**Branch:** `cursor/beta-data-isolation-audit`  
**Verifier:** Cursor agent (automated suite + Supabase MCP read-only SQL + code-path audit)  
**Context:** TestFlight launches after Anonymous Sign-Ins enabled; verification run before external beta testers.

### Isolation area summary

| Area | Result | Evidence |
|------|--------|----------|
| Dealer shifts | **PASS** | RLS `Users manage own shifts` (FOR ALL, `auth.uid() = user_id`); `HomeDashboard` inserts set `user_id`; `app/page.tsx` SELECT relies on RLS; legacy NULL rows invisible |
| Gaming sessions | **PASS** | RLS `Users manage own playing sessions`; `HomeDashboard` inserts set `user_id`; UPDATE/DELETE by id protected by RLS |
| Stats / history | **PASS** | `StatsScreen` applies `excludeDemoRecords` before totals; History lists in-memory data loaded post-RLS filter; empty lists render empty-state UI |
| My Hands | **PASS** | `saved_hands.user_id NOT NULL`; RLS policy present; `fetchSavedHands` / `saveHand` / `deleteSavedHand` all filter `.eq("user_id", userId)` |
| Settings | **PASS** | `fetchSettings` / `createDefaultSettings` / `updateSettings` all scope by `user_id`; `AppSettingsProvider` reloads on `userId` change |
| Demo data isolation | **PASS** | `seedDemoData` only in `DeveloperSettings`; inserts `is_demo: true` + `user_id`; `clearDemoData` scoped to current user; stats exclude demo |
| localStorage / dev preview | **PASS** | 6 keys documented in `lib/user-storage.ts`; `AuthProvider.applyUserChange` calls `clearUserLocalState`; `DeveloperPreviewProvider` resets preview on user change |
| RLS (database level) | **PASS** | Live MCP: `rowsecurity = true` on all 4 tables; exactly one FOR ALL policy per table; no extra/permissive policies; insert triggers present |
| Brand-new user clean start | **PASS** | Anonymous auth → unique uid; RLS returns empty arrays; Home shows `EmptyHomeState`; Stats show $0; History empty; My Hands empty; settings created per-user on first fetch |

**Overall automated verdict:** **PASS** — no isolation gaps found in automated verification.  
**Manual TestFlight A/B/C:** **PENDING** — required before external beta sign-off (steps below).

---

### Automated tests performed

| Command | Result | Count |
|---------|--------|-------|
| `npm test` | ✅ PASS | **46 tests** across **5 files** (18 in `lib/__tests__/data-isolation.test.ts`) |
| `npm run build` | ✅ PASS | Next.js production build + training content validation |

**`data-isolation.test.ts` coverage (18 tests):**

- `excludeDemoRecords` filtering
- localStorage key separation (`DEV_LOCAL_STORAGE_KEYS` vs `USER_LOCAL_STORAGE_KEYS`)
- `AuthProvider` clears keys on user change
- `DeveloperPreviewProvider` resets preview on user change
- Migration SQL: `user_id` columns, permissive policy drops, RLS policies, insert triggers
- `saved_hands` migration: NOT NULL `user_id`, RLS enabled
- Client insert scoping: `HomeDashboard`, `settings.ts`, `hands/storage.ts`, `demo-data.ts`
- `StatsScreen` uses `excludeDemoRecords` (BUG-103)
- Per-table RLS policy definitions in migration SQL

---

### Live Supabase verification (read-only, project `jjblqnnxmmgdkjntgkkh`)

**RLS enabled:**

| Table | `rowsecurity` |
|-------|---------------|
| `shifts` | true |
| `playing_sessions` | true |
| `app_settings` | true |
| `saved_hands` | true |

**Policies (one per table, no extras):**

| Table | Policy | `cmd` | `qual` | `with_check` |
|-------|--------|-------|--------|--------------|
| `shifts` | Users manage own shifts | ALL | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| `playing_sessions` | Users manage own playing sessions | ALL | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| `app_settings` | Users manage own app settings | ALL | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| `saved_hands` | Users manage own saved hands | ALL | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

Query for extra/permissive policies returned **0 rows** (no `"Allow all for anon"` remnants).

**Insert triggers:**

| Trigger | Table |
|---------|-------|
| `set_shifts_user_id` | `shifts` |
| `set_playing_sessions_user_id` | `playing_sessions` |
| `set_app_settings_user_id` | `app_settings` |

**Legacy orphan rows (unchanged, not deleted):**

| Table | Total | With `user_id` | NULL `user_id` |
|-------|-------|----------------|----------------|
| `shifts` | 11 | 0 | 11 |
| `playing_sessions` | 3 | 0 | 3 |
| `app_settings` | 2 | 1 | 1 |
| `saved_hands` | 0 | 0 | 0 |

NULL `user_id` rows remain invisible under RLS (`auth.uid() = user_id` never matches NULL).

---

### RLS cross-user isolation (documented SQL — do not run against prod with write intent)

To prove Account B cannot read Account A's rows **without creating test users in production**, use a **staging project** or Supabase SQL editor with two test JWTs. Expected behavior on production schema:

```sql
-- Authenticated as User B (JWT in request context):
SELECT * FROM public.shifts WHERE id = '<Account-A-shift-uuid>';
-- Expected: 0 rows

SELECT * FROM public.playing_sessions WHERE id = '<Account-A-session-uuid>';
-- Expected: 0 rows

UPDATE public.shifts SET title = 'cross-user probe' WHERE id = '<Account-A-shift-uuid>';
-- Expected: 0 rows affected (RLS WITH CHECK blocks visibility)

DELETE FROM public.shifts WHERE id = '<Account-A-shift-uuid>';
-- Expected: 0 rows deleted
```

Unit tests in `lib/__tests__/data-isolation.test.ts` assert migration-defined policies match this model. Live cross-user JWT tests were **not** run against production to avoid modifying user data.

---

### Code-path audit

| File / area | User scoping | RLS backup |
|-------------|--------------|------------|
| `lib/auth.ts` | Anonymous sign-in per install; `signOutUser` for fresh session | N/A (auth layer) |
| `lib/data-filters.ts` | `excludeDemoRecords` for stats | N/A |
| `app/page.tsx` | Loads only after `userId` ready; SELECT without client filter | ✅ RLS |
| `components/home/HomeDashboard.tsx` | Inserts include `user_id: userId` | ✅ RLS + triggers |
| `lib/db-mutations.ts` | UPDATE by id only | ✅ RLS |
| `components/history/HistoryScreen.tsx` | DELETE by id only | ✅ RLS |
| `lib/settings.ts` | All ops `.eq("user_id", userId)` | ✅ RLS |
| `lib/hands/storage.ts` | All ops `.eq("user_id", userId)` | ✅ RLS |
| `lib/demo-data.ts` | All ops scoped to `userId`; `is_demo: true` | ✅ RLS |
| `components/stats/StatsScreen.tsx` | `excludeDemoRecords` before aggregation | ✅ |
| `components/auth/AuthProvider.tsx` | `clearUserLocalState` on user change | N/A |
| `components/dev/DeveloperPreviewProvider.tsx` | Resets preview state on user change | N/A (UI-only preview) |
| `components/settings/AppSettingsContext.tsx` | Reloads settings when `userId` changes | ✅ |
| `components/dealing/DealingSection.tsx` | ⚠️ Dead code (not mounted); no explicit `user_id` on insert | ✅ RLS trigger fallback |
| `components/playing/PlayingSection.tsx` | ⚠️ Dead code (not mounted); no explicit `user_id` | ✅ RLS trigger fallback |

---

### localStorage keys (`lib/user-storage.ts`)

| Key | Category | Cleared on user change |
|-----|----------|------------------------|
| `trackdown_dev_preview` | Developer | ✅ `DEV_LOCAL_STORAGE_KEYS` |
| `trackdown_dev_solver_pro_preview` | Developer | ✅ |
| `trackdown_training_progress_v1` | User prefs | ✅ `USER_LOCAL_STORAGE_KEYS` |
| `trackdown_adaptive_training_v1` | User prefs | ✅ |
| `trackdown_blackjack_rules_v1` | User prefs | ✅ |
| `trackdown_last_tournament_hourly_rate` | User prefs | ✅ |

Triggered by `AuthProvider.applyUserChange` when `lastUserId !== nextUserId`. Verified by unit test reading source for `clearUserLocalState` call.

---

### Brand-new user empty state

| Screen | Behavior when no rows for `user_id` |
|--------|-------------------------------------|
| Home | `EmptyHomeState` when no active shift/session |
| Stats | $0 dealer earnings, $0 gaming net (empty filtered arrays) |
| History | Empty dealing/gaming lists |
| My Hands | `EmptyState` "No Saved Hands" |
| Settings | `fetchOrCreateSettings` creates fresh defaults for new user |

Data load in `app/page.tsx` waits for auth `userId`, resets state on user change, then fetches — RLS ensures zero rows for a new anonymous user.

---

### Manual verification steps (from audit — all required on TestFlight)

Perform on **three separate anonymous sessions** (reinstall, or Settings → Developer → **Sign Out & New Session** if exposed, or delete app + reinstall):

#### 1. Account A

1. Launch app → confirm **empty Home**, **$0 Stats**, **empty History**.
2. Start **one dealer shift** (any type) and **one gaming session**.
3. Note shift and session UUIDs (Settings → Developer → diagnostics, or Supabase dashboard with service role).

#### 2. Account B

1. Force a **new anonymous session** (reinstall app, or sign out + relaunch).
2. Confirm **empty Home**, **$0 Stats**, **empty History** — Account A data must not appear.
3. *(Optional deep check)* Attempt to fetch Account A shift by UUID via dev tools → expect **empty / permission denied**.

#### 3. Account C

1. Settings → enable **Developer Mode**.
2. Tap **Seed Demo Data**.
3. Confirm demo shifts/sessions appear in **History** but **Stats remain $0** (demo excluded).
4. Disable Developer Mode → confirm **preview UI clears**.
5. Sign out / new session → confirm demo and preview **gone**; fresh session starts clean.

#### 4. Cross-account

1. With Account B active, verify Account A shift/session UUIDs are **not visible** on Home, Stats, History, or Settings tabs.

---

### Manual TestFlight instructions (device checklist)

Use one physical device; repeat for accounts A, B, and C:

| Step | Account A | Account B | Account C |
|------|-----------|-----------|-----------|
| Fresh install / new session | ✅ First launch | ✅ After A, reinstall or sign out | ✅ After B, reinstall or sign out |
| Home empty | ☐ | ☐ | ☐ |
| Stats $0 | ☐ | ☐ | ☐ (also after seeding demo) |
| History empty | ☐ | ☐ | ☐ (before demo seed) |
| Create shift + session | ☐ | — | — |
| Record UUIDs | ☐ | — | — |
| A's data invisible | — | ☐ | ☐ |
| Enable dev mode + seed demo | — | — | ☐ |
| Demo in History, not in Stats | — | — | ☐ |
| Preview clears off dev mode | — | — | ☐ |
| Clean after sign-out | — | — | ☐ |

**Sign-out path on TestFlight:** Settings → Developer → **Sign Out & New Session** (requires Developer Mode). Alternative: delete app and reinstall for a guaranteed fresh anonymous user.

**Quick checklist:** [BETA-TESTFLIGHT-CHECKLIST.md](./BETA-TESTFLIGHT-CHECKLIST.md)

---

### Blockers before external beta

| Blocker | Severity | Status |
|---------|----------|--------|
| Manual A/B/C TestFlight run | **Medium** | **OPEN** — Sign Out & New Session UI added; human device sign-off pending |
| Auth fix on `main` / Railway | **Medium** | **OPEN** — `cursor/fix-testflight-auth-launch` (`f843f63`) not merged; required for WKWebView stale sessions |
| Legacy NULL `user_id` rows | None | Acceptable — invisible under RLS |
| No live JWT cross-user integration test in CI | Low | Acceptable for beta; staging project recommended later |
| Dead code paths without explicit `user_id` | Low | RLS triggers provide defense in depth; not mounted in app |

**Recommendation:** Proceed to external beta **after** completing the manual TestFlight checklist above. Automated isolation verification is **green**.
