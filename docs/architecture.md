# InOrdo UI-shell architecture

## Scope and status

This branch implements a frontend visual shell for InOrdo. It establishes the public landing experience, authenticated-product presentation, responsive layout, shared interface patterns, and a typed synthetic demo boundary. It does not implement production persistence, tenancy, authorization, OpenAI calls, API mutations, or database contracts.

The current repository is a vinext/Next-compatible React starter using TypeScript and the starter's existing CSS toolchain. The UI uses native React components and global design tokens without adding a component library.

## Experience map

| Route | Purpose | Data boundary |
| --- | --- | --- |
| `/` | Public landing page: pitch, problem, four-step workflow, principles, and honest demo entry | Static product content |
| `/demo` | Product shell and summit project dashboard | Typed synthetic fixture, visibly labeled |
| `/demo/components` | Isolated shared-state and accessibility reference | Static component examples, visibly labeled |

The primary flow keeps these states separate. A link styled as `View demo workspace` must not imply sign-in, persistence, or a live customer account.

Future routes may separate items, dependencies, impacts, and operation history. Until their contracts exist, dashboard quick links may be anchors or clearly unavailable controls rather than invented backend behavior.

## Frontend layers

### 1. Design tokens

Global CSS custom properties define:

- neutral page and surface colors;
- a deep evergreen primary accent;
- text, border, focus, positive, warning, and danger roles;
- typography scale and line heights;
- spacing and radius conventions;
- elevation used only where hierarchy needs it.

Status components pair color with text or a visible symbol. Focus styles use a high-contrast outline and offset. Motion remains minimal and respects reduced-motion preferences.

### 2. Shared presentation components

Shared primitives live under `components/ui`. The shell should expose small, composable components rather than page-specific variants:

- `PageHeader` for title, context, and actions;
- `Card` for grouped content with optional heading and footer;
- `Badge` or `StatusBadge` with text-backed variants;
- `Tabs` with correct selected and keyboard states;
- `EmptyState`, `ErrorState`, and `LoadingSkeleton` for explicit system states;
- `ConfirmationDialog` with initial focus, Escape behavior, and safe cancel path;
- `FormField` with visible label, hint, error association, and stable IDs;
- `IconButton` with an accessible name and visible tooltip only as supplemental help;
- `InlineResult` or toast pattern that does not disappear before assistive technology can announce it.

These components are presentation primitives. They must not embed database, authorization, or OpenAI behavior.

### 3. Application shell

`components/app-shell.tsx` owns the shared product frame. The `/demo` route composes it with dashboard content. The demo shell contains:

- a skip link to the main content;
- project selector area with a `Demo fixture` label;
- desktop sidebar and compact mobile navigation;
- top bar, breadcrumbs, and session menu;
- a single semantic `main` region and ordered heading structure;
- dashboard summary, milestones, blockers, source update, team, and workflow quick links.

The session menu is a visual shell unless connected to an existing verified session contract. It must not claim that authentication or tenancy enforcement is implemented.

### 4. Dashboard presentation

The dashboard consumes typed project data through one explicit boundary. It should render records and derived display counts; it should not scatter hard-coded values across components.

For this branch, the Regional Climate Action Summit workspace is a local synthetic fixture described in `docs/demo-scenario.md` and defined in `lib/demo-fixture.ts`. Fixture types should model only fields required for presentation, such as project summary, team members, milestones, risks, source status, and navigation counts. The fixture must be labeled in both code and visible UI. It must not be imported into server, database, or migration layers.

`/demo/components` provides isolated visual states for shared components. It is not part of the primary product flow and remains visibly separate from the summit workspace.

## Data and contract boundary

### Allowed in the UI shell

- TypeScript interfaces or types used solely to make the demo fixture explicit.
- Pure display derivations such as counts, date formatting, or badge labels.
- Local interaction state for navigation, dialogs, tabs, and non-persistent previews.
- A UI-only reset event that closes preview navigation and returns tabs to their
  default state without touching fixture records or backend data.
- Links to implemented routes or honest placeholders for future routes.

### Not implemented in this branch

- SQL schema, migrations, seed scripts, or RLS.
- Tenant or project membership enforcement.
- Sign-in, sign-out, session validation, or authorization changes.
- OpenAI requests, prompt logic, model parsing, or tool calls.
- API routes, action contracts, persistence, or background jobs.
- Applying proposals, recording real operations, or executing undo/reset on production data.
- Environment variable or package dependency changes for product behavior.

The initial empty-repository bootstrap and removal of unused starter-only packages are documented in `docs/dependency-rationale.md`. No dependency was added for product behavior.

## Backend dependencies owned with Deston's contracts

The visual shell will eventually require versioned, authorized contracts for:

1. **Workspace context:** current user, tenant, project list, project membership, and permitted actions.
2. **Project overview:** typed records, owners, dates, state, milestones, blockers, team, and explicit dependency edges.
3. **Evidence intake:** persisted raw source text, provenance, timestamp, author, and review state.
4. **Extraction:** model-produced candidate changes, validation errors, model/version metadata where appropriate, and reviewer corrections.
5. **Impact review:** deterministic direct/indirect classifications, ordered dependency paths, supporting evidence, and stale-graph handling.
6. **Proposal:** action previews, validation, conflicts, per-action approval state, and idempotency.
7. **Operations:** attributable application results, immutable history, reversible-operation metadata, undo result, and failure recovery.
8. **Demo reset:** an isolated, authorized reset endpoint that cannot affect non-demo data.

Until these contracts exist and are verified, the UI should describe corresponding screens as demo fixture, preview, or not connected.

## Accessibility conventions

- A skip link becomes visible on focus and targets the main content.
- Navigation uses landmarks, lists, current-page state, and text labels.
- Every icon-only control has an accessible name; decorative icons are hidden from assistive technology.
- Headings follow the document hierarchy without choosing levels for size alone.
- Forms keep labels visible and associate hints and errors with inputs.
- Dialogs have a programmatic title and description, trap focus while open, support Escape where safe, and return focus to the trigger.
- Tabs use the appropriate tab, tablist, and tabpanel semantics with keyboard navigation when they switch content in place.
- Dynamic results use an appropriate live region without announcing routine decorative changes.
- Touch targets remain comfortable on mobile, and status does not rely on color alone.

## Responsive conventions

- **Approximately 375 px:** single-column content, compact header, collapsible navigation, full-width primary actions, and cards that wrap long labels safely.
- **Approximately 768 px:** two-column sections where the content remains readable; navigation may remain compact.
- **Approximately 1440 px:** bounded content width, persistent sidebar, and balanced dashboard columns rather than stretched text.
- Tables or relationship views use a labeled local scroll region when they cannot reflow; the page itself must not overflow horizontally.
- Avoid hover-only disclosure and excessive animation.

## Content and interaction rules

- The product sequence is always **Evidence -> Impact -> Proposal -> Approval -> History and undo**.
- `Proposed` never means `Applied`; `Approved` must identify the human action that caused a mutation.
- Impact explanations name the evidence and dependency path.
- Buttons use action language. Links navigate; buttons change state or open controls.
- Loading, empty, error, success, disabled, and pending states are distinct.
- An unfinished AI or backend action is labeled rather than simulated as successful.

## Verification approach

- Run lint, typecheck where available, unit tests, production build, and `git diff --check`.
- Keep the UI-only TypeScript check scoped to `app`, `components`, and `lib`; verify the retained generated Worker adapter through the production build.
- Inspect the landing page and demo shell with keyboard-only navigation.
- Check at approximately 375, 768, and 1440 px for clipping, order, readable labels, and page overflow.
- Confirm visible focus, skip-link behavior, heading order, dialog focus, mobile navigation, and non-color status cues.
- Check browser console output and verify no client-side secret or private data is exposed.
- Record verification gaps; do not convert an untested state into a product claim.
