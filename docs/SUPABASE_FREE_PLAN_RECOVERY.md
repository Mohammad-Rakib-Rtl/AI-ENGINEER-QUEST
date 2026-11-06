# Database recovery

The app cannot resume a paused project. Connection errors can also come from the network, configuration, missing tables, or authentication.

## Paused project

1. Open https://supabase.com/dashboard as the project owner.
2. Select the organization and project, and inspect its status.
3. If **Resume project** is offered, follow it and wait for the project to become available.
4. Return to the app and use **Retry connection** in Settings & Backup or refresh.
5. Check your previous tasks, notes, and study data. Export local drafts before resolving conflicts.

Do not delete the paused project. If resuming is unavailable, inspect the dashboard's restoration options and contact Supabase support/community. Consult the current [free project pausing documentation](https://supabase.com/docs/guides/platform/free-project-pausing) for eligibility and restoration windows; the app does not guarantee provider policies.

## Running project with connection problems

- Check internet connectivity and whether your project URL is reachable.
- Check both environment variables locally or in Vercel Settings.
- Restart the local development server or redeploy Vercel after changing variables.
- Confirm the migration was run and email/password authentication is enabled.
- Sign in again after session expiration. Export unsynced drafts before switching accounts.

Use the app normally and export backups weekly. No artificial keep-alive requests or polling are implemented.
