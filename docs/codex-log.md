# Codex implementation log

## 2026-07-18 — Repository bootstrap

- Replaced the prior repository application history with a clean root `main` foundation at the user’s direction.
- Scaffolded the current stable Next.js App Router application with TypeScript, ESLint, Tailwind CSS, `src/`, and the `@/*` alias.
- Added the approved P0 runtime and testing dependencies, Node 22/npm scripts, Vitest setup, and an honest landing-shell smoke test.
- Added environment documentation, ownership and security rules, product/architecture/demo/QA documentation, CI and contribution templates, MIT licensing, and Supabase CLI configuration.
- Kept the landing state explicit that the demo workspace and product workflows are not yet operational.
- No private transcript, credential, or environment value is included in this log.

## 2026-07-18 — UI shell integration onto shared main

- Fetched the reinitialized `main` branch and confirmed it had a new root commit
  unrelated to the original UI branch history.
- Created a local-only safety ref, then connected both histories with an
  uncommitted merge that completed without Git conflicts.
- Kept the new npm, Next.js `src/`, CI, Supabase configuration, environment
  handling, and ownership boundaries as the baseline.
- Ported the responsive landing entry, application shell, shared components,
  typed synthetic fixture, and local preview interactions into `src/`.
- Removed only the obsolete Vinext, pnpm, Worker, and duplicated root-app
  scaffold from the earlier branch.
- Did not change SQL, migrations, RLS, authorization, OpenAI code, API contracts,
  environment values, or production mutation behavior.
- Verified the integrated tree with npm clean install, ESLint, full TypeScript,
  four Vitest checks, and a production build containing `/`, `/demo`, and
  `/demo/components`. The local Codex runtime uses Node 24 and reported the
  expected engine warning because the repository and CI remain pinned to Node 22.
- Browser-tested all three routes at approximately 375, 768, and 1440 pixels
  with no page overflow or console warnings/errors. Rechecked mobile drawer
  focus containment, Escape focus return, tab selection, and local preview reset.
