# InOrdo product brief

**Product:** InOrdo

**Track:** Work and Productivity

## Executive summary

InOrdo helps a team understand what a new piece of evidence changes across a project, review a traceable recovery plan, approve only the actions it wants, and undo approved operations. It is designed to work as a standalone project workspace; integrations may be added later but are not required for the core experience.

The Build Week experience is intentionally narrow. A synthetic 4-12 person team pastes a source update, GPT-5.6 structures the change, deterministic dependency traversal identifies direct and downstream impacts, and the product presents evidence-backed recovery actions for selective human approval. No autonomous mutation is part of the P0 story.

## Vision

Make project change understandable and recoverable. When reality shifts, every team should be able to see what changed, why it matters, what can be done, who approved each action, and how to reverse it.

## Audience

Long-term users include:

- student teams and university clubs;
- startups and software teams;
- agencies and campaign teams;
- nonprofits;
- teams coordinating software development, marketing or media launches, events, campaigns, and general projects.

### Primary persona

A project lead in a small, cross-functional team who maintains plans across tasks, decisions, dates, risks, and artifacts. They need to respond quickly when source information changes, but cannot safely update every downstream item from memory.

## Jobs to be done

- When new evidence changes a plan, show me the affected work before I edit anything.
- When an impact is proposed, show me the source and dependency path that support it.
- When recovery work is suggested, let me approve actions one by one.
- When an approved operation causes a problem, let me inspect and undo it.
- When I return later, preserve a traceable record of evidence, decisions, approvals, and operations.

## Problems

- Downstream plans become invalid when an upstream date, decision, or constraint changes.
- Coordination depends on manual messages and individual memory.
- Important context is lost across documents and conversations.
- Deadlines are missed because blockers and dependency paths are hidden.
- Decisions and their reasons become difficult to trace.
- Existing project tools often show current state without explaining how a change propagated.

## Value proposition

InOrdo turns a source update into a reviewable change set. It combines structured extraction with deterministic project relationships so the team can examine evidence, distinguish direct from downstream impact, approve a recovery plan selectively, and retain an undoable history.

## Product principles

1. **Evidence before action.** Show the source update and extraction before showing a proposal.
2. **Deterministic reach, bounded AI.** GPT-5.6 structures ambiguous text; explicit dependency traversal determines graph reach.
3. **People approve mutations.** Suggestions are not changes. P0 never applies them autonomously.
4. **Traceability by default.** Each impact links back to evidence and a dependency path.
5. **Reversible operations.** Approved changes appear in history and can be undone where supported.
6. **Useful on its own.** A team can maintain native project records without a connector.
7. **Honest states.** The interface distinguishes live data, synthetic fixtures, previews, unavailable actions, and errors.

## Long-term vision

InOrdo becomes a dependable change-control layer for everyday project work. Native records hold the team's operational context; optional connectors can add evidence without becoming a requirement. A team can follow a changed fact across projects, compare possible recovery plans, apply only authorized actions, and inspect a durable, reversible decision trail. The product remains useful to a small student team while allowing stronger collaboration, governance, and portfolio views to grow around the same evidence and dependency model.

## Scope

### P0: Build Week demo

- Native project records for tasks, milestones, decisions, events, risks, and artifacts.
- Explicit dependencies between records.
- A pasted source update.
- GPT-5.6 structured extraction of the changed fact.
- Deterministic traversal of directly and indirectly affected records.
- Evidence-backed impact review with visible dependency paths.
- A recovery proposal with actions that can be approved selectively.
- Operation history, undo, and a reliable demo reset.
- A responsive, accessible visual shell for the product story.

The current UI-shell branch may represent parts of this flow with labeled synthetic fixture data. A visual state is not proof that its backend operation or AI step is implemented.

### P1

- Collaborative assignments, comments, and notifications.
- Stronger project filtering, search, and saved views.
- Proposal editing, approval roles, and richer conflict handling.
- Broader item relationships and reusable project templates.
- Hardened tenancy, audit presentation, observability, and error recovery.

### Future

- Optional source and work-management connectors.
- Scheduled evidence intake and configurable review workflows.
- Portfolio-level dependency views and cross-project impact analysis.
- Enterprise administration and native mobile experiences when justified by validated needs.

## Explicit non-goals for P0

- Autonomous mutation of project records.
- Retrieval-augmented generation, embeddings, or semantic search infrastructure.
- Connectors, n8n workflows, or required external services.
- Enterprise administration.
- A native mobile app.
- Replacing team judgment with an AI recommendation.
- Claiming production readiness from a synthetic demo.

## Representative user stories

- As a project lead, I can paste a dated source update so that the change is captured as evidence.
- As a reviewer, I can compare the source text with the structured extraction before continuing.
- As a team member, I can see direct and downstream impacts with a reason and dependency path.
- As an owner, I can approve one recovery action while leaving another unapproved.
- As an operator, I can inspect who approved an operation and undo it where supported.
- As a demo presenter, I can reset the synthetic workspace to a known baseline.

## Functional requirements

- Display a project overview and typed project items.
- Display explicit dependency relationships.
- Accept a pasted source update and preserve the original text.
- Present structured extracted fields separately from the raw evidence.
- Traverse dependencies deterministically and label direct versus indirect impacts.
- Present an evidence link and path for every impact.
- Generate or display a recovery proposal without applying it.
- Support independent approval state per proposed action.
- Record applied operations and support undo when the operation is reversible.
- Reset the demo fixture to its documented baseline.

## Nonfunctional requirements

- Responsive at approximately 375, 768, and 1440 px with no page-level horizontal overflow.
- Keyboard-operable navigation and controls, visible focus, a skip link, semantic headings, and descriptive labels.
- Status meaning conveyed through text or icons as well as color.
- Predictable loading, empty, error, and success states.
- Typed fixture and contract boundaries.
- No client-side secret access.
- Plain language suitable for a judge or a first-time project lead.

## Success criteria

For the demo, a judge can:

1. understand the project and source update without explanation from a team member;
2. identify why the event date changed;
3. distinguish direct from downstream impacts;
4. trace an impact back to the source and dependency path;
5. approve selected recovery actions while leaving one unapproved;
6. see an operation in history and understand how undo works;
7. reset the workspace to the same baseline.

These are experience criteria, not claims about production performance or customer outcomes.

## Ethical and privacy considerations

- Minimize source text and personal data sent to a model; use synthetic data in the public demo.
- Make model-generated extraction and proposals visibly distinct from user-authored evidence.
- Preserve the original evidence so reviewers can challenge an extraction.
- Avoid hidden scoring of people, performance, or intent.
- Require human approval for mutations and keep an attributable history.
- Define retention, access, and deletion rules before using private production data.

## Known constraints

- The demo uses one synthetic workspace and does not establish multi-tenant production readiness.
- AI extraction can be incomplete or wrong; deterministic traversal is only as accurate as the extracted change and explicit dependency graph.
- Some operations may not be safely reversible and must be labeled accordingly.
- Backend persistence, authorization, tenancy, OpenAI integration, and production mutation contracts remain separate implementation responsibilities.
- Integrations are optional future work; standalone records must remain useful.

## UI conventions

### Visual language

- Use a restrained neutral surface palette with one deep evergreen primary accent. Reserve amber and red for attention and destructive risk, not decoration.
- Use a compact, legible type scale with clear heading levels and comfortable body line height.
- Build spacing from a small repeatable scale and use moderate, consistent corner radii. Shadows should clarify elevation, not create visual noise.
- Use motion sparingly and respect `prefers-reduced-motion`.

### State and status

- Pair every status color with explicit text and, where useful, a symbol: for example `Blocked`, `Needs review`, `Approved`, or `Undone`.
- Keep evidence, detected impact, proposed action, approved operation, and undo as separate states.
- Disable or label unavailable actions; never use a polished button to imply an unfinished feature works.
- Use loading skeletons only when content is expected, an empty state when no records exist, and an error state with a useful recovery instruction.

### Layout and navigation

- Public landing content uses a clear pitch, problem, four-step workflow, principles, and an honest demo entry.
- The application shell uses a project selector, sidebar or compact navigation, top bar, breadcrumbs, and a labeled session menu.
- On small screens, navigation collapses without hiding the current project or primary task.
- Page headers, cards, badges, tabs, fields, dialogs, icon buttons, and inline results share consistent semantics and focus behavior.

### Content language

Use this sequence consistently:

1. **Evidence** — the original source update.
2. **Impact** — records reached through explicit dependencies.
3. **Proposal** — suggested recovery actions that have not been applied.
4. **Approval** — a person's explicit choice to apply a selected action.
5. **History and undo** — the resulting operation record and its available reversal.
