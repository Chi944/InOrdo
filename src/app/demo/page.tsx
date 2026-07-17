import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, EmptyState, InlineResult, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/tabs";
import { demoFixture, demoSummary, type DisplayStatus } from "@/lib/demo-fixture";

export const metadata: Metadata = {
  title: "Synthetic summit workspace",
  description: "A clearly labeled InOrdo UI fixture for reviewing evidence, impact, recovery proposals, history, and undo.",
};

const statusTones: Record<DisplayStatus, "neutral" | "positive" | "warning" | "danger" | "info" | "proposed"> = {
  "on-track": "positive",
  blocked: "danger",
  "needs-review": "warning",
  proposed: "proposed",
  complete: "positive",
  open: "info",
};

const recordTypeLabels = {
  task: "Tasks",
  milestone: "Milestones",
  decision: "Decisions",
  event: "Events",
  risk: "Risks",
  artifact: "Artifacts",
} as const;

export default function DemoDashboard() {
  const recordTypeCounts = Object.entries(recordTypeLabels).map(([type, label]) => ({
    label,
    count: demoFixture.records.filter((record) => record.type === type).length,
  }));

  const impactTabs = [
    {
      id: "direct",
      label: `Direct (${demoSummary.directImpactCount})`,
      panel: <ImpactList impacts={demoFixture.directImpacts} kind="Direct impact" />,
    },
    {
      id: "downstream",
      label: `Downstream (${demoSummary.indirectImpactCount})`,
      panel: <ImpactList impacts={demoFixture.indirectImpacts} kind="Downstream impact" />,
    },
  ] as const;

  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow={demoFixture.fixtureLabel}
        title={demoFixture.project}
        description="Review how one venue update reaches the summit plan before any recovery action is approved."
        meta={
          <>
            <Badge tone="warning">{demoFixture.reviewStatus}</Badge>
            <span>{demoFixture.workspace}</span>
            <span className="page-header__date"><s>{demoFixture.originalDate}</s> <span aria-hidden="true">→</span> <strong>{demoFixture.proposedDate}</strong></span>
          </>
        }
        actions={<a className="button button--primary" href="#evidence">Review source update</a>}
      />

      <InlineResult tone="warning">
        UI preview only. Extraction, approvals, operation history, undo, and reset are not connected to a backend in this build.
      </InlineResult>

      <section aria-labelledby="summary-title" className="metric-grid">
        <h2 className="sr-only" id="summary-title">Project change summary</h2>
        <article className="metric-card"><span>Updates awaiting review</span><strong>{demoSummary.updatesAwaitingReview}</strong><small>Source evidence preserved</small></article>
        <article className="metric-card"><span>Direct impacts</span><strong>{demoSummary.directImpactCount}</strong><small>One dependency hop</small></article>
        <article className="metric-card"><span>Downstream impacts</span><strong>{demoSummary.indirectImpactCount}</strong><small>Explicit multi-hop paths</small></article>
        <article className="metric-card"><span>Open risks</span><strong>{demoSummary.openRiskCount}</strong><small>One high-severity review</small></article>
      </section>

      <div className="dashboard-grid">
        <Card className="card--wide source-card" eyebrow="Evidence" id="evidence" title={demoFixture.evidence.title} description={`${demoFixture.evidence.source} · received ${demoFixture.evidence.received}`}>
          <blockquote>{demoFixture.evidence.text}</blockquote>
          <div className="evidence-footer">
            <span>Original source text</span>
            <Badge tone="neutral">Synthetic fixture</Badge>
          </div>
          <div className="extraction-preview">
            <div className="extraction-preview__heading">
              <div><p className="eyebrow">Structured change preview</p><h3>Candidate event-date change</h3></div>
              <Badge tone="warning">{demoFixture.evidence.extraction.state}</Badge>
            </div>
            <dl>
              <div><dt>Record</dt><dd>{demoFixture.evidence.extraction.record}</dd></div>
              <div><dt>Property</dt><dd>{demoFixture.evidence.extraction.property}</dd></div>
              <div><dt>Previous value</dt><dd>{demoFixture.evidence.extraction.previousValue}</dd></div>
              <div><dt>Proposed value</dt><dd>{demoFixture.evidence.extraction.newValue}</dd></div>
              <div className="extraction-preview__reason"><dt>Reason</dt><dd>{demoFixture.evidence.extraction.reason}</dd></div>
            </dl>
            <p className="support-note">GPT-5.6 is intended to structure this candidate change. No model call runs in this UI-shell branch.</p>
          </div>
        </Card>

        <Card title="Upcoming milestones" description="Dates shown from the synthetic baseline.">
          <ul className="milestone-list">
            {demoFixture.milestones.map((milestone) => (
              <li key={milestone.id}>
                <div className="date-tile"><strong>{milestone.date.split(" ")[0]}</strong><span>{milestone.date.split(" ")[1]}</span></div>
                <div><strong>{milestone.title}</strong><span>{milestone.date} · {milestone.owner}</span></div>
                <Badge tone={statusTones[milestone.status]}>{milestone.statusLabel}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Open blockers and risks" description="Risk state is not inferred from color alone.">
          <ul className="risk-list">
            {demoFixture.risks.map((risk) => (
              <li key={risk.id}>
                <span className="risk-list__mark" aria-hidden="true">!</span>
                <div><strong>{risk.title}</strong><span>{risk.id} · Owner: {risk.owner}</span></div>
                <Badge tone={statusTones[risk.status]}>{risk.statusLabel} · {risk.severity}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="card--wide" id="impacts" eyebrow="Impact" title="Evidence-backed impact review" description={`Deterministic traversal follows ${demoFixture.dependencyPathCount} explicit dependency edges in the fixture.`}>
          <Tabs items={impactTabs} label="Impact classification" />
        </Card>

        <Card className="card--wide" id="proposal" eyebrow="Proposal" title="Selective recovery preview" description="Selections illustrate the review state only. No action can be applied from this shell.">
          <ul className="proposal-list">
            {demoFixture.recoveryActions.map((action) => {
              const unapproved = action.previewState === "unapproved";
              return (
                <li className={unapproved ? "is-held" : undefined} key={action.id}>
                  <span className="proposal-list__check" aria-hidden="true">{unapproved ? "—" : "✓"}</span>
                  <div><strong>{action.label}</strong><span>{action.id} · Owner: {action.owner}</span>{action.rationale ? <small>{action.rationale}</small> : null}</div>
                  <Badge tone={unapproved ? "warning" : "proposed"}>{unapproved ? "Unapproved" : "Selected in preview"}</Badge>
                </li>
              );
            })}
          </ul>
          <InlineResult tone="info">A proposed recovery plan is not permission to mutate project records.</InlineResult>
        </Card>

        <Card id="items" title="Project records" description={`${demoSummary.recordCount} typed records across the six P0 record types.`}>
          <div className="record-types">
            {recordTypeCounts.map((item) => <div key={item.label}><strong>{item.count}</strong><span>{item.label}</span></div>)}
          </div>
        </Card>

        <Card id="dependencies" title="Dependency paths" description="Paths explain why downstream records are included.">
          <ol className="path-list">
            <li><span>1 hop</span><code>EVT-01 → TASK-04</code><small>Travel review</small></li>
            <li><span>2 hops</span><code>EVT-01 → TASK-05 → ART-05</code><small>Volunteer roster</small></li>
            <li><span>3 hops</span><code>EVT-01 → TASK-03 → M-02 → ART-04</code><small>Briefing pack</small></li>
          </ol>
        </Card>

        <Card className="card--wide" title="Team" description="Eight fictional roles coordinate the synthetic summit.">
          <ul className="team-grid">
            {demoFixture.team.map((member) => (
              <li key={member.name}><span className="avatar" aria-hidden="true">{member.initials}</span><div><strong>{member.name}</strong><span>{member.role}</span></div></li>
            ))}
          </ul>
        </Card>

        <Card id="history" title="Operation history and undo" description="Applied operations will appear here when a verified backend contract exists.">
          <EmptyState title="No operations applied" description="This preview has no operation history. Undo becomes available only after an approved, reversible operation." />
          <button className="button button--secondary" type="button" disabled>Undo latest operation</button>
        </Card>

        <Card title="Quick links" description="Jump to the working sections in this UI shell.">
          <nav aria-label="Dashboard quick links" className="quick-links">
            <a href="#items"><span>Project items</span><span aria-hidden="true">→</span></a>
            <a href="#dependencies"><span>Dependencies</span><span aria-hidden="true">→</span></a>
            <a href="#impacts"><span>Impact review</span><span aria-hidden="true">→</span></a>
            <a href="#history"><span>History & undo</span><span aria-hidden="true">→</span></a>
            <Link href="/demo/components"><span>UI patterns</span><span aria-hidden="true">→</span></Link>
          </nav>
        </Card>
      </div>
    </div>
  );
}

function ImpactList({ impacts, kind }: { impacts: readonly { id: string; title: string; reason: string; path: string }[]; kind: string }) {
  return (
    <ul className="impact-list">
      {impacts.map((impact) => (
        <li key={impact.id}>
          <span className="impact-list__mark" aria-hidden="true">↗</span>
          <div><strong>{impact.title}</strong><p>{impact.reason}</p><code>{impact.path}</code></div>
          <Badge tone="info">{kind}</Badge>
        </li>
      ))}
    </ul>
  );
}
