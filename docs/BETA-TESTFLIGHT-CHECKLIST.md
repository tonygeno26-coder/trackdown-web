# Trackdown — TestFlight Beta Checklist

**Last updated:** 2026-08-11  
**Full audit:** [DATA-ISOLATION-AUDIT.md](./DATA-ISOLATION-AUDIT.md)

## Pre-flight (Supabase + deploy)

- [ ] **Anonymous Sign-Ins** enabled in Supabase Auth (required for TestFlight)
- [ ] Railway deploys **`main` + auth fix** (`cursor/fix-testflight-auth-launch`) — auth fix is **not yet on main** (see [Deploy target](#deploy-target))
- [ ] iOS build uploaded to TestFlight with latest web bundle (`npm run build` → Capacitor sync)

## Device smoke test (5 min)

1. Cold launch → Home loads (no auth error screen)
2. Start dealer shift + gaming session → data persists after background/foreground
3. Stats and History reflect created records

## A/B/C data isolation (required before external beta)

Use **one device**, three sessions via **Settings → Developer → Sign Out & New Session** (enable Developer Mode first: tap version 7× on Settings).

| Check | A (first session) | B (after sign-out) | C (after sign-out) |
|-------|-------------------|--------------------|--------------------|
| Home empty | ☐ | ☐ | ☐ (before demo) |
| Stats $0 | ☐ | ☐ | ☐ |
| History empty | ☐ | ☐ | ☐ (before demo) |
| Create shift + session | ☐ | — | — |
| Note UUIDs in Developer diagnostics | ☐ | — | — |
| A's data invisible | — | ☐ | ☐ |
| Dev mode → Seed Demo Data | — | — | ☐ |
| Demo in History, Stats still $0 | — | — | ☐ |
| Disable dev mode → preview clears | — | — | ☐ |
| Sign out → demo gone, clean start | — | — | ☐ |

**Pass criteria:** Account B and C never see Account A's shift/session UUIDs on any tab.

## Deploy target

| Branch | Status | Contains |
|--------|--------|----------|
| `main` | Merged PR #1 | Data isolation + RLS (`76d229a`) |
| `cursor/beta-data-isolation-audit` | +1 commit ahead | Verification doc (`9cbfcec`) + Sign Out UI |
| `cursor/fix-testflight-auth-launch` | **Not on main** | WKWebView stale session recovery (`f843f63`) |

**Recommended Railway deploy:** merge `cursor/fix-testflight-auth-launch` into `main` (via PR), then deploy `main`. Until then, deploy the auth-fix branch for TestFlight builds.

## Sign-off

| Gate | Status |
|------|--------|
| Automated isolation tests (`npm test`) | ✅ PASS |
| Live Supabase RLS verification | ✅ PASS |
| Manual A/B/C on TestFlight device | ☐ PENDING |
| Auth launch on TestFlight device | ☐ PENDING (needs auth fix deployed) |

**External beta:** proceed after manual A/B/C + auth smoke test pass on device.
