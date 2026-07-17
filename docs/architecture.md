# InOrdo architecture

## System shape

```text
Browser
  │ public Supabase client only
  ▼
Next.js App Router
  ├─ Server Components: reads and presentation
  ├─ Server actions/routes: validation, authorization, orchestration
  ├─ OpenAI adapter: candidate extraction and recovery drafts
  └─ Domain services: dependency traversal, approvals, operations, undo
  │
  ▼
Supabase Postgres + Auth + RLS
```

## Boundaries

### Web

Use React Server Components by default. Client Components may hold browser interaction state but must not import server secrets, call OpenAI, or make authorization decisions.

### Evidence and model output

Persist raw source text and provenance before interpretation. A server-only OpenAI adapter requests structured output from `OPENAI_MODEL`; Zod validates the response into a candidate change or recovery draft. Validation failure produces a reviewable error and no mutation.

### Deterministic impact

Store explicit directed dependency edges. Domain code traverses those edges from the reviewed changed record, records direct versus downstream depth, prevents cycles, and returns at least one ordered path for every affected item. The model does not choose graph reach.

### Approval and mutation

A recovery action is immutable proposal data until a person selects it. Before application, server code rechecks identity, project membership, permission, current record version, action validation, and idempotency. A successful mutation and its reversible before-state are recorded in one transaction.

### Undo and reset

Undo creates a compensating operation; it does not erase history. Demo reset is a server-only, secret-protected operation limited to the configured synthetic project slug. It must be deterministic and unable to target a non-demo project.

## Security invariants

- Service-role and OpenAI keys remain server-only.
- RLS applies to all user-scoped tables.
- Model output never directly mutates data.
- Public demo data is synthetic.
- Authorization and approval checks fail closed.

## Planned modules

- `src/lib/supabase/`: typed browser and server clients.
- `src/features/evidence/`: intake, validation, and provenance.
- `src/features/impact/`: dependency graph traversal and path explanations.
- `src/features/proposals/`: recovery drafts and per-action approval state.
- `src/features/operations/`: authorized application, history, undo, and reset.
- `supabase/migrations/`: schema, constraints, functions, and RLS policies.

These module paths describe intended boundaries, not completed features.

## Implemented UI shell

The current frontend adds presentation-only routes without changing the server,
Supabase, authorization, or model contracts:

| Route | Purpose | Current data boundary |
| --- | --- | --- |
| `/` | Public product story and demo entry | Static product content |
| `/demo` | Responsive project dashboard and review narrative | Typed local synthetic fixture |
| `/demo/components` | Shared component and state reference | Isolated static examples |

Shared presentation code lives under `src/components/`, while the fixture and
UI utilities live under `src/lib/`. The fixture is never imported into a server
contract, migration, or authorization layer.

### UI conventions

- Global tokens define restrained neutral, evergreen, status, focus, spacing,
  radius, and typography roles.
- Status meaning always includes text and a symbol rather than color alone.
- The product shell provides a skip link, landmarks, breadcrumbs, visible focus,
  a keyboard-contained mobile drawer, and a single main-content region.
- Tabs support arrow keys, Home, and End. Confirmation dialogs support Escape,
  safe cancellation, and focus return.
- The reset control restores local navigation and tab state only. It never
  changes fixture records or implies that the production reset contract works.
- Layouts are designed for approximately 375, 768, and 1440 pixels without page
  overflow or hover-only disclosure.

The UI sequence is **evidence → impact → proposal → approval → history and
undo**. Proposed actions remain inert, and unfinished capabilities are labeled
as preview or not connected.
