# Trackdown Web

Next.js + Supabase, same stack pattern as CollabHub.

## 1. Open in Cursor

Unzip this and open the folder in Cursor. Make sure you've got the Supabase and Railway MCP plugins connected (same as CollabHub).

## 2. Install dependencies

```bash
npm install
```

## 3. Create the Supabase project

In the Supabase dashboard, create a new project (e.g. `trackdown`). Once it's up:

- Copy the **Project URL** and **anon public key** from Settings → API.
- Copy `.env.local.example` to `.env.local` and paste them in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 4. Run the schema

Don't run this through the Supabase SQL editor UI if you're using the MCP plugin in Cursor — use `execute_sql` (same as CollabHub) so the PostgREST schema cache doesn't get out of sync:

Paste the contents of `supabase/schema.sql` into Cursor and ask it to run via `execute_sql`. It creates one table, `shifts`, with a `blocks` jsonb column holding the pre-built down schedule for that shift.

**Note on RLS:** the schema currently allows all operations via the anon key — fine for a personal single-user tool right now. Before this is ever shared with anyone else, swap that policy for real Supabase Auth-scoped rows.

## 5. Run it locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 6. Deploy to Railway

Same as CollabHub:

- Push this repo to GitHub.
- In Railway, create a new project from the repo.
- Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Railway's variables tab.
- Railway will run `npm run build` then `npm run start` (already wired to `$PORT` in `package.json`).

## Data model

One table, `shifts`:

- `type`: `'tournament'` or `'cash'`
- `down_length`: `30` or `40`
- `start_time`, `ended_at`
- `status`: `'active'` or `'completed'` — only one active shift expected at a time
- `blocks`: jsonb array, each block has `scheduledStart`/`scheduledEnd`, `status` (`pending`/`done`/`skipped`), `tournament`/`table`/`game`, `tips`, `notes`

No down-rate/pay math yet — that gets added once you know your rate for the week.
