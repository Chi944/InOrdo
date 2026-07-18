# Local run and test guide

This guide gives Deston on Windows and Andres on macOS the same repeatable local workflow. It uses the hosted InOrdo Supabase project and the manually linked Vercel project; Docker is not required unless someone intentionally starts a disposable local Supabase stack.

## Shared safety rules

- Use Node.js 22.x. Confirm with `node --version` before installing dependencies.
- Never commit, paste, screenshot, or send `.env.local`, passwords, API keys, cookies, service-role values, or reset secrets.
- Each teammate should receive access to the Vercel and Supabase projects through the provider account controls. Do not transfer `.env.local` through chat, email, or Git.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are browser-configured values. Every other configured name is server-only.
- Until `OPENAI_API_KEY` is intentionally added, `/api/health` must return generic `503 not_ready`; this is expected and live analysis must remain unclaimed.
- Use only the fictional Regional Climate Action Summit workspace and the operator-provisioned demo Auth account.

## Deston: Windows setup

Use PowerShell. Install Git and a Node version manager if they are not already available. With nvm-windows, select Node 22 and then verify the active runtime:

```powershell
nvm install 22.23.1
nvm use 22.23.1
node --version
npm --version
```

Clone and install from a clean checkout:

```powershell
git clone https://github.com/Chi944/InOrdo-Hackathon.git
Set-Location InOrdo-Hackathon
git switch main
git pull --ff-only origin main
npm ci
```

Link the checked-out repository to the existing Vercel project and pull its Production configuration into the ignored local file:

```powershell
npx vercel login
npx vercel link --yes --project inordo-hackathon --scope chi944s-projects
npx vercel env pull .env.local --environment=production --yes
git check-ignore .env.local
git status --short
```

`git check-ignore` should print `.env.local`; `git status --short` should not list it. On an existing machine, first remove any obsolete local `OPENAI_API_KEY` entry through a private editor if OpenAI is intentionally disabled. Never echo or paste its value into a terminal command.

## Andres: macOS setup

Use Terminal with zsh or bash. With nvm, select Node 22 and verify it before installing:

```bash
nvm install 22
nvm use 22
node --version
npm --version
```

Clone and install from a clean checkout:

```bash
git clone https://github.com/Chi944/InOrdo-Hackathon.git
cd InOrdo-Hackathon
git switch main
git pull --ff-only origin main
npm ci
```

After Andres has been granted project access in Vercel, link and pull the same Production configuration without sharing a file or value out of band:

```bash
npx vercel login
npx vercel link --yes --project inordo-hackathon --scope chi944s-projects
npx vercel env pull .env.local --environment=production --yes
git check-ignore .env.local
git status --short
```

If the Vercel link or pull is denied, Deston should add Andres to the provider project. Do not work around access control by sending the environment file.

## Confirm the hosted Supabase link

This is read-only verification. It does not push or reset the database:

```bash
npx --no-install supabase login
npx --no-install supabase link --project-ref hctvqaxkxqmqodzeshjm
npx --no-install supabase migration list --linked
```

The local and remote migration columns must match through `20260719113000`. Do not run `supabase db reset` against the hosted project. Do not run `supabase db push` unless a reviewed migration is intentionally being released.

## Start the application

Windows PowerShell and macOS use the same application commands:

```bash
npm run dev
```

Open `http://localhost:3000`. Before OpenAI is configured, verify:

- `/` renders the public landing page;
- `/login` renders the email/password form;
- signed-out `/app` redirects to `/login?next=%2Fapp`;
- `/api/health` returns generic `503 not_ready`; and
- the server log names only `OPENAI_API_KEY` as missing and never logs a value.

Stop the development server with `Ctrl+C`.

## Automated verification

Run this full gate on both operating systems before handing off a commit:

```bash
npm run lint
npm run typecheck
npm run test:run
npx playwright install chromium
npm run test:e2e
npm run build
npm audit --omit=dev
git diff --check
git status --short
```

The guarded Playwright journey uses production components with provider/database seams intercepted. It is useful regression evidence, but it is not proof of live Auth, RLS, Supabase RPC, or OpenAI behavior.

To smoke the optimized build locally after `npm run build`:

```bash
npm run start
```

Then repeat the public route checks at `http://localhost:3000` and stop with `Ctrl+C`.

## Provision each teammate's demo account

Follow `docs/demo-user-setup.md`. Create the account in **Supabase Dashboard > Authentication > Users**, keep the password outside Git, and map that Auth UUID to the seeded `civic-futures-lab-demo` workspace using the reviewed SQL block in that document. Prefer a separate account for each teammate so actor attribution remains meaningful.

With the account configured:

1. Sign in at `/login` and confirm `/app` loads the synthetic summit workspace.
2. Open items, decisions, risks, and dependencies and verify the documented dependency direction.
3. Sign out and confirm `/app` no longer returns workspace data.
4. Try an invalid password and confirm the error is useful but reveals no Supabase detail.

## Full live workflow after OpenAI is enabled

This section targets **`https://inordo-hackathon.vercel.app`**, not the local server. Do not run it until `OPENAI_API_KEY` is stored through Vercel's hidden secret input, a new production deployment is ready, and `https://inordo-hackathon.vercel.app/api/health` returns `200 ready`. Open the production URL in a fresh private/incognito browser and sign in with the operator-provisioned synthetic account.

The Production secret is intentionally not present in either teammate's `.env.local` right now. If authorized local live-provider testing is needed later, each tester must enter their own approved key directly into the ignored `.env.local` through a private editor, restart `npm run dev`, and require `http://localhost:3000/api/health` to return `200 ready`. Never transmit that key through Git, chat, email, terminal history, screenshots, or logs; remove it again when the local live test is complete.

Use the exact synthetic update from `docs/demo-scenario.md`:

> Venue update - 20 July 2026: The campus convention hall is unavailable on 12 September 2026. The venue team has offered 26 September 2026 instead. All other venue terms remain unchanged.

Then verify, without recording private bodies or credentials:

1. The source is preserved and the candidate change proposes `event_date` from `2026-09-12` to `2026-09-26`.
2. Deterministic direct and indirect paths appear, including event -> speaker confirmation -> programme lock -> briefing pack.
3. No project item changes before explicit human approval.
4. Select only an eligible reversible field update and leave any sensitive/human-input action pending.
5. Apply once, inspect actor-attributed ordered history, and confirm replay is idempotent.
6. Undo the reversible operation and confirm the original plus compensating operation both remain visible.
7. Exercise a stale-state conflict and confirm nothing is applied.
8. Reset only the named synthetic project and confirm 24 active records, 26 dependencies, the baseline event date, one generation advance, and retained archived history.
9. Verify viewer, nonmember, and cross-project attempts fail closed.

## Andres's interface review

After the authenticated workflow works, Andres should repeat it at approximately 375, 768, and 1440 CSS pixels. Check keyboard-only navigation, visible focus, dialog focus return, labels and headings, status/error announcements, reduced-motion behavior, and absence of horizontal overflow. Capture the protected-workspace screenshot or video only after this live pass, and label all data as synthetic.

## Deston's release review

Deston should confirm the linked migration ledger, generated database types, RLS/security advisors, health state, exact deployment SHA, provider model metadata, approval/undo/reset invariants, and rollback target. Record only safe IDs, counts, statuses, timestamps, and the actual model name; never record source bodies, prompts, output, credentials, cookies, or environment values.
