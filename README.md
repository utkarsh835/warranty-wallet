# Warranty Wallet

A private, responsive warranty manager built with Next.js App Router, React, TypeScript, Tailwind CSS, and Supabase Auth/PostgreSQL. All warranty entry is manual: no AI, OCR, camera, invoice uploads, or separate backend service is needed.

## Requirements

- Node.js **22 LTS** (Node 20 LTS also works with compatible Next.js 15 releases).
- npm (bundled with Node.js).
- Git.
- A Supabase account/project for real authentication and persistence.
- Optional: Playwright browser binaries for browser tests.

Verify the tools:

```bash
node --version
npm --version
git --version
```

## 1. Install dependencies

Open a terminal in the `warranty-wallet` folder:

```bash
npm install
```

Dependency installation could not be completed in the build environment because DNS resolution for `registry.npmjs.org` was unavailable, so a lockfile could not be generated or validated here. On a machine with internet access, run `npm install` first to create `package-lock.json`, then commit it. After the lockfile exists, use `npm ci` for reproducible installs.

## 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com/) and sign in or create an account.
2. Create a new project, choose a name and a strong database password, and select a region near your users.
3. Wait for the database to finish provisioning.
4. Open the project dashboard and select **Connect** (or open **Project Settings → API Keys**).
5. Copy the **Project URL** and the **publishable key**. The publishable key is safe to include in browser configuration only because all exposed tables are protected by RLS. Do not use a secret/service-role key here.

## 3. Configure local environment variables

At the project root (the same folder as `package.json`), copy `.env.example` to a new file named `.env.local`.

macOS/Linux:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and replace the placeholders:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

- `NEXT_PUBLIC_SUPABASE_URL`: paste the **Project URL** from Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: paste the **publishable key** from the same project.

Do not add quotes unless your shell/editor requires them. Do not commit `.env.local`; it is ignored by `.gitignore`. Restart `npm run dev` after changing environment variables.

## 4. Apply the database migration

The migration is `supabase/migrations/202610260001_initial_schema.sql`.

**Dashboard method (beginner-friendly):**

1. Open your Supabase project.
2. Choose **SQL Editor** → **New query**.
3. Open the migration file in your editor and copy its entire contents into the SQL Editor.
4. Click **Run**. Review any errors before proceeding.
5. Open **Table Editor** and verify `profiles` and `warranties` exist in the `public` schema. In **Authentication → Users**, new signups should create matching profile rows.

The migration creates case-insensitive unique usernames, database validation constraints, a trigger to create a profile during signup, computed expiry dates, indexes, and RLS policies. Do not disable RLS to work around permission errors. If you use the Supabase CLI instead, install the CLI, link the project with `supabase link`, then run `supabase db push`; avoid applying the same migration twice manually and through the CLI.

### Database security model

- A profile's `id` is the corresponding `auth.users.id`.
- The signup trigger reads the username from signup metadata and creates the profile atomically. Invalid or duplicate usernames cause signup to fail rather than leaving a profile-less account.
- Warranty writes include the signed-in user ID, and the insert policy verifies it matches `auth.uid()`. RLS scopes SELECT/UPDATE/DELETE to the same owner.
- `profiles` and `warranties` both have RLS enabled. Never expose a service-role/secret key to the browser.
- Expiry is a generated database column using the same month-end-clamping rule as the TypeScript helper. January 31 + one month becomes the final day of February.

## 5. Configure email verification and password recovery

1. In Supabase, open **Authentication → URL Configuration** (wording may vary by dashboard version).
2. Set the **Site URL** for local development to `http://localhost:3000`.
3. Add `http://localhost:3000/**` to the allowed redirect URLs (or the exact callback URL `http://localhost:3000/auth/callback` if your project UI expects exact URLs).
4. For production, add your deployed HTTPS origin and callback, for example `https://your-app.vercel.app/**`, and set the production Site URL.
5. Keep email confirmation enabled to use the verification flow. The app displays a confirmation message after signup; the user must click the email link before signing in.
6. For local development, Supabase's built-in email service may have sending limits. Configure SMTP in **Authentication → SMTP Settings** for reliable delivery. Do not put SMTP credentials in client-side variables.
7. The forgot-password page sends a recovery link back through `/auth/callback?next=/settings`. The recovery route exchanges the one-time code and opens `/reset-password`, where the user can set a new password.

## 6. Run the application

```bash
npm run dev
```

Open **http://localhost:3000**. Create an account, verify the email, then sign in. Add a warranty, open its detail page, edit it, search and filter the list, and delete it after confirming the browser dialog.

## 7. Checks and tests

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Run the browser tests (requires Playwright browser binaries):

```bash
npx playwright install chromium
npm run test:e2e
```

The current automated suites cover username/password/email/warranty validation, month-end and leap-year expiry calculations, warranty status boundaries, and auth-form component behavior. The Playwright tests cover public auth page smoke checks. **Live Supabase integration, database migration execution, real email verification, cross-user RLS attack tests, full authenticated CRUD E2E, and password recovery completion must be run against a configured Supabase project; they are not considered verified by local unit tests.** No production credentials are bundled with the repository.

### Suggested manual security test

1. Register and verify User A, then create a warranty.
2. Register User B in a separate browser profile/incognito session and confirm A's warranty is not visible.
3. As User B, attempt a direct Supabase query for A's warranty ID; it should return no row under RLS. Attempt an update/delete for that ID; it must not change A's record.
4. Try to insert a warranty with User A's `user_id` while authenticated as User B; the database must reject it under the insert policy.
5. Try registering usernames `Alex` and `alex`; the second must be rejected by the unique lower-case index.
6. Confirm the table editor shows RLS enabled on both tables.

## 8. Production deployment (Vercel)

1. Push this repository to a private/public Git repository.
2. In [Vercel](https://vercel.com/), choose **Add New → Project**, import the repository, and keep the Next.js defaults.
3. In the Vercel project, open **Settings → Environment Variables**.
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` using values from the same Supabase project. Select the environments you need (Production, Preview, Development).
5. Deploy. Copy the deployed HTTPS origin.
6. Return to Supabase **Authentication → URL Configuration** and add the production origin/callback to allowed redirect URLs, and set the production Site URL.
7. Redeploy after changing Vercel environment variables. Never add a Supabase secret/service-role key to a `NEXT_PUBLIC_` variable.

## 9. Common problems

- **Missing environment variables:** confirm `.env.local` is at the root, the variable names match exactly, and restart the dev server.
- **Invalid API key / URL:** use the Project URL and publishable key from the same Supabase project; do not paste a database password or service-role key as the publishable key.
- **Permission denied / empty data:** confirm the migration ran successfully, RLS policies exist, the user is signed in, and `warranties.user_id` matches `auth.uid()`. Do not disable RLS.
- **Signup says username is taken:** choose another username; uniqueness is case-insensitive. If signup previously failed after a duplicate, retry with a different username.
- **Signup fails unexpectedly:** inspect Supabase **Logs → Postgres/Auth**. Confirm the migration's profile trigger exists and the username is 3–20 ASCII letters/digits.
- **Verification email missing:** check spam, allowed redirect URLs, Auth email settings, and SMTP configuration. The built-in sender can be rate-limited.
- **Recovery link redirects incorrectly:** make sure `/auth/callback` is in the allowed redirect URLs and the Site URL matches the current environment.
- **Dependency/install errors:** use Node 22 LTS, delete `node_modules` only if necessary, then run `npm ci` again. Keep `package-lock.json` committed.
- **Build errors:** run `npm run typecheck` and `npm run lint` first. Check that environment variables exist in the deployment environment; do not commit `.env.local`.
- **Date differs by a day:** purchase/expiry values are calendar dates (`YYYY-MM-DD`), not timestamps. Avoid converting them with local-midnight `Date` constructors in business logic.

## Project structure

```text
src/app/                 Next.js pages and routes
src/components/          Auth, app shell, warranty list and form
src/lib/dates.ts         Pure calendar date/status functions
src/lib/validation.ts    Shared Zod validation schemas
src/lib/supabase/        Browser and server Supabase clients
supabase/migrations/     Version-controlled schema, trigger and RLS
src/**/*.test.*          Vitest unit/component tests
e2e/                     Playwright smoke tests
.env.example             Safe configuration template
```

## Notes / known scope

- No AI/OCR provider, camera, invoice upload, or separate API server is required.
- Usernames are unique profile identifiers; sign-in uses email and password as requested.
- Email verification is delegated to Supabase Auth.
- Password recovery email initiation is implemented; the dedicated final password update form is not yet included.
- Live database and cross-account tests require your own configured Supabase project and should be completed before production use.
