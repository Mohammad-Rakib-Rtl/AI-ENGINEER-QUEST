# Set up Supabase

## 1. Open your project

Go to https://supabase.com/dashboard and choose project `oqvakvwsohfjoceladiv`. Check that it is running. Your local `.env.local` already contains the URL and publishable key you supplied and is ignored by Git. The publishable key enables the browser client; it does not create tables or a user account.

## 2. Create the database

1. Open **SQL Editor → New query**.
2. Copy all of [001_quest_state.sql](../supabase/migrations/001_quest_state.sql).
3. Click **Run** once.
4. In **Table Editor**, confirm `public.quest_state` exists, RLS is enabled, and the three policies restrict access to `auth.uid() = user_id`.

This is a one-time migration. Rerunning it will encounter existing policy/function/trigger names. Administration cannot be performed using the supplied publishable key.

## 3. Create your personal account

1. Open **Authentication → Users → Add user → Create new user**.
2. Enter your email and a strong password. Use auto-confirm if offered for this manually created personal account.
3. In **Authentication → Sign In / Providers**, enable email/password authentication and disable **Allow new users to sign up** for this personal app.
4. Keep the password in your password manager, outside this repository.

The app provides sign-in without a public signup form. Dashboard signup settings enforce the additional restriction.

## 4. Run and sign in

```powershell
npm ci
npm run dev
```

Open http://localhost:3000 → **Settings & Backup**. Export any existing guest records before signing in. Then sign in and import the backup to move it into your separate cloud workspace.

Wait for **Saved to Supabase**. That appears only after a successful database write, or after loading a saved cloud record.

## 5. Verify real persistence

1. Complete a task and wait for **Saved to Supabase**.
2. In Supabase **Table Editor → quest_state**, find the row with your user ID. Its `payload` contains the records and `revision` increases with changes.
3. Refresh the app and verify the task stays complete.
4. Sign in from a different browser/device and verify it loads there.
5. Create a note and repeat.

## 6. Verify isolation

1. Manually create a temporary second user in the Dashboard.
2. Sign in as that user in another browser profile. Your first user's records must not appear.
3. Create a task; confirm its workspace row belongs to the second user's ID.
4. A request using user B's browser session filtered to user A's ID must return no rows. Insert/update requests targeting user A's ID must not succeed.
5. SQL Editor is privileged and can see both rows; use authenticated browser clients to test RLS.

Automated tests mock network responses; they do not establish live RLS security. This check requires real test accounts.

## Troubleshooting

- **Missing table / PGRST205:** run the migration in the correct project.
- **Invalid credentials:** check email, password, account confirmation, and email/password provider settings.
- **Cloud unavailable:** keep the device draft, then use **Retry connection**. Browser reconnect events also retry; there is no polling.
- **Newer cloud version:** export the local draft, then use **Load cloud version**. Manually recover missing text from the export.
- **Cannot reach project:** check project status, network, and configuration. A failed request does not prove it is paused.

After changing `.env.local`, stop the server with Ctrl+C and run `npm run dev` again.

Official references: [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [password sign-in](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [securing data](https://supabase.com/docs/guides/database/secure-data).
