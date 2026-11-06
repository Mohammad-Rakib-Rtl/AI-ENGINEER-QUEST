# Verification — November 6, 2026

- `npm run build`: passed, with static prerendering for `/` and the not-found route.
- `npm run typecheck`: passed.
- Five Playwright integration tests: passed in headless Chrome.
- Desktop (1440 px) and mobile (390 px) screenshots inspected. Mobile page overflow check passed; the wide calendar scrolls inside its own card.
- Tests cover timer refresh persistence, task/entry recovery, contribution deduplication, invalid backup rejection, download initiation, roadmap progress/notes persistence, curriculum week/day/problem-target totals, and mocked Supabase save confirmation/conflicts. The mocked cloud test also verifies only roadmap completion IDs and notes are uploaded, with no lesson text.
- Installed dependencies: `npm install` reported zero known vulnerabilities at installation time.
- `.env.local` is ignored and excluded from tracked source.

Production `.next/static` assets total 929.7 KiB. All emitted JavaScript chunks total 864.8 KiB raw / 258.1 KiB gzip. These are output-directory sums, not measured first-load network transfer. The self-hosted Manrope Latin variable font is 24,836 bytes.

## Remaining live checks

Requests to the supplied Supabase project returned `ECONNRESET` from this development environment. Real password sign-in, database writes, and deployed RLS isolation have not been verified. The supplied publishable key cannot run administrative SQL; the project owner must apply the migration and create a user in the Dashboard. Follow [SETUP.md](SETUP.md).

GitHub push and Vercel deployment require the destination repository and account access. Follow [DEPLOYMENT.md](DEPLOYMENT.md); no live deployment has been claimed.
