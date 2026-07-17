# InOrdo contribution guide

## Ownership

- Andres owns product UX: information architecture, interface copy, visual design, accessibility, responsive behavior, and frontend presentation.
- Deston owns database design, migrations, RLS, authorization, server contracts, OpenAI integration, and production data flows.
- Shared decisions include typed contract changes, end-to-end workflow behavior, release readiness, and claims made in public materials.

## Guardrails

- Keep the product story consistent: **evidence -> impact -> approval -> undo**.
- Treat pasted updates and project records as evidence. Show why an item is affected before asking a person to approve a change.
- Never imply that a proposal has been applied until a person explicitly approves it.
- Keep fixtures clearly labeled. Do not mix synthetic demo records with production data or claim they came from a live integration.
- Do not add secrets, private personal data, fake customer logos, inflated metrics, or claims that have not been verified.
- Do not expose client-side environment secrets.

## Change boundaries

- UX work should prefer presentation-only changes and existing typed data.
- Before changing SQL, migrations, RLS, authorization, OpenAI code, API contracts, environment handling, or dependencies, document the need and coordinate with the owner.
- Do not add a component library unless an existing dependency cannot meet an essential accessibility or product need.
- Preserve standalone operation. Connectors and external integrations are future, optional capabilities.

## Interface conventions

- Use semantic HTML, a skip link, visible keyboard focus, descriptive control labels, and status text or icons in addition to color.
- Design from 375 px upward and check layouts near 375, 768, and 1440 px without horizontal page overflow.
- Prefer calm, direct language. Use `Evidence`, `Impact`, `Proposal`, `Approval`, `History`, and `Undo` consistently.
- Mark unavailable or illustrative features honestly, for example `Demo fixture`, `Preview`, or `Not connected`.

## Verification

Before handing off a change, run the applicable lint, typecheck, unit-test, build, and `git diff --check` commands. Record any unavailable command or unresolved dependency instead of presenting it as passed.
