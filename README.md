# InOrdo

InOrdo helps teams understand what a project change affects before they approve
it. The product story is intentionally ordered:

**Evidence -> impact -> proposal -> approval -> history and undo.**

This branch contains a responsive frontend visual shell. It does not implement
production authentication, tenancy, persistence, OpenAI calls, approvals,
operations, or undo.

## Routes

- `/` — public landing page with the problem, workflow, principles, and an
  honest demo entry.
- `/demo` — simulated application shell and synthetic summit dashboard.
- `/demo/components` — isolated reference for shared component states.

All demo people, records, dates, and updates are fictional. The visible fixture
label is part of the acceptance criteria.

## Local development

Requirements:

- Node.js 22.13 or newer
- pnpm 11

```bash
pnpm install
pnpm run dev
```

The local application is available at `http://localhost:3000` by default.

## Verification

```bash
pnpm run lint
pnpm run typecheck
pnpm run test:run
pnpm run build
pnpm run test:smoke
git diff --check
```

## Ownership boundary

Andres owns the product UX and frontend presentation on this branch. Deston
owns database design, RLS, authorization, server contracts, OpenAI integration,
and production mutation behavior. See `AGENTS.md`, `docs/architecture.md`, and
`docs/dependency-rationale.md` before changing those boundaries.
