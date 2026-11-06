# GitHub → Vercel deployment

## 1. Check locally

From the `website` folder:

```powershell
npm ci
npm run typecheck
npm run build
```

The app root contains `package.json`. Do not upload `node_modules`, `.next`, `.env.local`, or screenshots; they are ignored. The self-hosted variable font is approximately 25 KB.

## 2. Create an empty repository

1. Open https://github.com/new.
2. Choose a name such as `ai-engineer-quest` and **Private** if preferred.
3. Leave automatic README, `.gitignore`, and license creation unchecked.
4. Create the repository and copy its HTTPS URL.

## 3. Push

If Git is not initialized yet:

```powershell
git init -b main
git add .
git commit -m "Build colorful AI Engineer Quest with Supabase sync"
```

If a commit already exists, skip those commands. Replace `YOUR_USERNAME` with your GitHub username:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/ai-engineer-quest.git
git push -u origin main
```

Git Credential Manager may open GitHub sign-in in a browser. If `origin` already exists, inspect `git remote -v` before changing it with `git remote set-url origin YOUR_REPOSITORY_URL`.

Check environment exclusion before pushing:

```powershell
git check-ignore .env.local
git status --short
```

The publishable key is meant for browsers. Never put a Supabase service-role or secret key in a `NEXT_PUBLIC_` variable.

## 4. Deploy on Vercel

1. Open https://vercel.com/new and sign in with GitHub.
2. Allow access to the repository and choose **Import**.
3. Confirm **Next.js** as the framework, Node.js 22 or newer, and the default build command/output directory.
4. Root Directory is `./` if this app is the repository root. If you pushed a parent folder, choose the actual `website` directory.
5. Add both variables below, copying their values from `.env.local`. Set them for Production and Preview. Do not include quote characters.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

6. Click **Deploy** and open the returned `.vercel.app` URL.

Changing variables requires a new deployment because public Next.js environment values are built into the browser bundle. A local `.env.local` does not automatically configure Vercel.

## 5. Verify the deployed app

1. In Supabase **Authentication → URL Configuration**, set Site URL to the Vercel HTTPS URL. Password sign-in is implemented; this setting also prepares for future email-link flows.
2. Run the migration and create your personal user if you have not already; see [SETUP.md](SETUP.md).
3. Sign in from the deployed site, complete a task, save a session, and create a note.
4. Wait for **Saved to Supabase**, refresh, and verify persistence.
5. Test another browser/device and export a backup.

## Future changes

```powershell
git add .
git commit -m "Describe your changes"
git push
```

Vercel builds the pushed version automatically when Git integration is connected. Review build logs if a deployment fails.

Official references: [Vercel environment variables](https://vercel.com/docs/environment-variables), [adding variables and redeploying](https://vercel.com/kb/guide/how-to-add-vercel-environment-variables), [Next.js deployment](https://nextjs.org/docs/app/getting-started/deploying).
