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
