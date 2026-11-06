# AI Engineer Quest 🚀

Rakib’s personal learning workspace, built with Next.js, TypeScript, Supabase, and Lucide. White surfaces, a deep-purple sidebar, self-hosted Manrope typography, colorful cards, and a GitHub-style activity calendar.

## Start here

1. Install Node.js 22 or newer and run `npm ci`.
2. Your supplied Supabase configuration is in the ignored `.env.local` file on this computer. Elsewhere, copy `.env.example` to `.env.local` and fill in your project URL and publishable key.
3. Run `supabase/migrations/001_quest_state.sql` in your Supabase SQL Editor once.
4. Create your personal email/password user in Supabase Authentication → Users. Disable public signups in Authentication settings.
5. Run `npm run dev`, open http://localhost:3000, and sign in under Settings & Backup.
6. Wait for **Saved to Supabase** before closing the app.

Full instructions: [Supabase setup](docs/SETUP.md), [GitHub & Vercel](docs/DEPLOYMENT.md), [backups](docs/BACKUP_AND_RESTORE.md), [connection recovery](docs/SUPABASE_FREE_PLAN_RECOVERY.md).

## Features

- Responsive dashboard, mobile sidebar, task creation/removal/completion, and learning roadmap.
- Expandable 24-week roadmap: 10 milestones, 168 concrete daily plans, weekly objectives, progress, and weekly/milestone notes. The curriculum lives in `lib/curriculum.ts`; only checked task IDs and personal notes are stored in the workspace. See [roadmap behavior](docs/LEARNING_ROADMAP.md).
- Persistent study timer: start, pause, resume, reset, save.
- Actual activity history: completed tasks (once per task per day), saved study sessions, and new text entries. No sample activity or invented past dates.
- Create/delete text entries for notes, coding, mistakes, systems, research, and career tracking.
- Supabase password sign-in, persistent browser sessions, sign-out, and private cloud saving.
- Debounced writes with confirmed save status, local recovery drafts, reconnect retry, and revision checks to stop stale overwrites from other devices.
- Validated JSON backup import/export with replacement confirmation.

## Data behavior

Each authenticated user owns one compact JSON row in `quest_state`, protected by PostgreSQL Row Level Security. The browser client uses a publishable key and Supabase Auth session; no privileged secret key is used. Private data loads in the browser through RLS and is not part of server-rendered HTML.

Guest and signed-in workspaces are separate. To move device data to your cloud account, export while signed out, sign in, then import. User recovery caches are separated by user ID and remain in browser storage after signing out. Use a trusted personal device and clear its browser data when retiring it.

Contribution dates use the browser's local day. The calendar shows approximately 52 weeks plus a partial alignment week. Older records without dated history are not backfilled. If a newer cloud revision exists, export the local draft before choosing **Load cloud version**; the app does not automatically merge conflicting changes.

## Checks

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

With Chrome already installed, PowerShell can use `$env:PLAYWRIGHT_CHANNEL='chrome'; npm test` instead of downloading Chromium.

Tests cover local persistence, timer refresh, contribution counts, mobile navigation/overflow, malformed backup rejection, and mocked Supabase confirmation/conflicts. They do not verify your live account or RLS; follow the two-account check in [SETUP.md](docs/SETUP.md).

## Structure

```text
app/                  Dashboard, layout, styles
components/           Activity calendar and account UI
lib/                  Types, validation, Supabase client, save/recovery logic
supabase/migrations/  Private table, RLS, revision trigger
tests/                Browser integration tests
docs/                 Setup, deployment, backup, recovery
```

## Scope

This is a compact workspace, not every feature from the original long brief. Coding entries are freeform records rather than a verified solved-problem counter. Detailed problem fields, editing existing entries, full journal/report workflows, password reset UI, and the original multi-table schema remain future work. No file uploads, external recruitment APIs, polling, or paid services are required.
