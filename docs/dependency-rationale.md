# Frontend dependency rationale

Recorded before package cleanup on 17 July 2026.

The `andres/02-ui-shell` branch began as an empty repository. The Sites starter
was used to create the smallest existing frontend build surface that can run a
typed React UI, lint it, test its fixture logic, and produce a production build.
That bootstrap introduced package metadata because none existed to preserve.

## Retained frontend and deployment spine

- React and Next-compatible vinext for the typed page and component structure.
- TypeScript and ESLint for static verification.
- Vite, the Sites plugin, Cloudflare adapter, and Wrangler for the generated
  build target already selected by the starter.
- The Worker adapter retains only asset, image, and application-router bindings.
  Its generated, unused `DB` type declaration was removed while D1 remains
  explicitly unconfigured, so this branch does not establish a database contract.
- Tailwind/PostCSS packages already supplied by the starter; no component
  library or external icon package is introduced.

## Removed starter-only surfaces

- `react-loading-skeleton` and the disposable loading-preview component after
  the real InOrdo pages replace it.
- Drizzle dependencies and generated empty database/example files because this
  UX branch must not introduce a schema, SQL, or persistence contract.
- The unused optional ChatGPT auth helper because the demo shell must not imply
  that authentication or tenancy is implemented.

No new dependency is added for class merging, components, icons, tests, or
browser automation. Unit tests use Node's built-in test runner; visual checks
use the in-app browser. The package manager is recorded as pnpm because the
provided runtime exposes pnpm 11.9.0, while all scripts remain conventional
package scripts.

## Typecheck boundary

The UI typecheck covers `app`, `components`, and `lib`. The retained generated
Worker adapter is verified by the production build, not the UI-only typecheck.
Adding backend-specific Cloudflare global types solely for this UX branch would
expand Deston's contract surface without product benefit.

## Environment handling

The generated Vite configuration retains only local, non-secret Wrangler paths
and a sandbox-specific file-watching switch required by the starter's preview
runtime. It does not define product environment variables, read credentials, or
expose values to client components. Application environment and secret handling
remain outside this UX branch and ignored `.env*` files are not committed.
