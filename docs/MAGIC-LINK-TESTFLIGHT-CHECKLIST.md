# Magic link — TestFlight verification checklist

Use a **physical iPhone** on the latest TestFlight build after the auth email fix is deployed to Railway.

## Supabase pre-check (Dashboard)

- [ ] **Site URL** = production Railway app URL
- [ ] **Redirect URLs** includes `com.desertspore.trackdown://auth-callback`
- [ ] **Email** auth enabled
- [ ] **Anonymous** sign-in enabled

## 1. First-time guest linking

1. Fresh install (or sign out so login screen shows).
2. Create a shift as guest.
3. Choose **Save guest account with email** (not returning sign-in).
4. Submit a **new** email address.
5. Expect **Check your email to save this guest** (no success if send failed).
6. Open link on the same device → app leaves login; guest shifts still visible.

## 2. Returning-user sign-in (fresh install)

1. Fresh install with a **new** anonymous guest.
2. Tap **Already have an account? Sign in**.
3. Enter an email that **already has** a Trackdown account.
4. Open link → signed into that account (guest on device replaced; server guest not auto-deleted).

## 3. Cold-start link

1. Force-quit Trackdown.
2. Tap magic link from Mail.
3. App opens via `com.desertspore.trackdown://auth-callback` (not stuck in Safari only).
4. Session completes; home loads.

## 4. Warm-resume link

1. Open Trackdown (login or background).
2. Tap a **new** magic link.
3. App foregrounds and completes sign-in.

## 5. Expired / reused link

1. Use an old or already-opened link.
2. Expect banner: **Your last sign-in link didn't complete** with expired/used message.
3. Request a **new** email and open only the latest link once.

## 6. Safari vs Trackdown

When tapping the link, confirm **Trackdown opens** (custom URL scheme). If Safari shows the Railway site with `?code=` but the app never opens, fix Supabase redirect allow-list before retesting.

## Email template note

Supabase **Confirm signup / Magic Link** templates should use the **`{{ .ConfirmationURL }}`** (or equivalent) link that includes the PKCE **`code`** query parameter after redirect — not a hash-only fragment session. PKCE codes are **single-use** and short-lived; failed attempts need a **fresh** email.
