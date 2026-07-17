# Codex implementation log

## 2026-07-17 — Responsive UI shell

### Request

Bootstrap InOrdo's product UX on the fresh `andres/02-ui-shell` branch with an accessible landing page, authenticated-application presentation, shared components, and a project dashboard aligned to the evidence -> impact -> approval -> undo story.

### Documentation work

- Added repository ownership and change guardrails in `AGENTS.md`.
- Defined the standalone product direction, P0 boundaries, non-goals, and UI conventions in the product brief.
- Defined a fully synthetic Regional Climate Action Summit fixture, including its exact venue date update, dependency paths, expected impact, selective approval, undo narrative, and reset baseline.
- Documented the frontend visual-shell architecture, routes, typed fixture boundary, accessibility and responsive conventions, and required backend contracts.

### Boundaries

- This session began from a fresh, empty product branch and used the existing starter only as the frontend base.
- No backend implementation is claimed in these documents.
- The documentation work did not change SQL, migrations, RLS, OpenAI code, authorization logic, API contracts, environment handling, or package dependencies.
- Demo people, records, and updates are synthetic and visibly described as fixture data.

### Frontend bootstrap decision

- The branch contained no application or package metadata, so the Sites/vinext starter supplied the frontend and build spine.
- The dependency rationale was recorded before initialization and promoted to `docs/dependency-rationale.md` before package cleanup.
- No component library, icon package, test runner, or browser automation package was added.
- Generated Drizzle/database examples, optional auth helper, and disposable loading preview are removed rather than committed as implied product capabilities.
- The retained Worker adapter remains a deployment concern; the UI typecheck is deliberately bounded to frontend code and the production build verifies the adapter.

### Verification record

- `pnpm run lint` — passed.
- `pnpm run typecheck` — passed.
- `pnpm run test:run` — passed, 5 tests.
- `pnpm run build` — passed for `/`, `/demo`, and `/demo/components`.
- `pnpm run test:smoke` — passed against the production server-rendered output, 2 tests.
- Browser review — passed at approximately 375, 768, and 1440 pixels with no horizontal page overflow. The landing page, dashboard, mobile navigation, tabs, confirmation dialog, focus return, and component-reference page were exercised. The browser console had no warnings or errors in the final session.
- Accessibility follow-up — browser testing exposed inconsistent native Escape handling in the confirmation dialog, so an explicit keyboard fallback was added and verified to close the dialog and return focus to its trigger.
- `git diff --check` and the staged-tree equivalent are required immediately before commit.
