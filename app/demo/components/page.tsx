import type { Metadata } from "next";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Badge, Card, EmptyState, ErrorState, FormField, IconButton, InlineResult, LoadingSkeleton, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "UI patterns" };

export default function ComponentReferencePage() {
  const exampleTabs = [
    { id: "evidence", label: "Evidence", panel: <p>Source text stays visible before a candidate change is reviewed.</p> },
    { id: "impact", label: "Impact", panel: <p>Dependency paths explain why each record is affected.</p> },
    { id: "approval", label: "Approval", panel: <p>Actions remain proposed until a person approves them.</p> },
  ] as const;

  return (
    <div className="pattern-page">
      <PageHeader eyebrow="Frontend reference" title="Shared UI patterns" description="An isolated, synthetic reference for the visual shell. These components do not connect to product data or backend actions." meta={<Badge tone="neutral">Internal demo route</Badge>} />

      <div className="pattern-grid">
        <Card title="Status badges" description="Symbols and text preserve meaning without color.">
          <div className="badge-row"><Badge tone="positive">Approved</Badge><Badge tone="warning">Needs review</Badge><Badge tone="danger">Blocked</Badge><Badge tone="proposed">Proposed</Badge><Badge tone="info">Direct impact</Badge></div>
        </Card>

        <Card title="Tabs" description="Arrow keys, Home, and End move between tabs.">
          <Tabs items={exampleTabs} label="Workflow example" />
        </Card>

        <Card title="Form field" description="Labels, help, and errors remain explicitly associated.">
          <FormField id="example-source" label="Source title" help="Use a concise name that reviewers can recognize." placeholder="Venue update" />
          <FormField id="example-error" label="Evidence date" error="Enter a date before continuing." defaultValue="" />
        </Card>

        <Card title="Icon button and inline result" description="Icon-only controls still have an accessible name.">
          <div className="pattern-actions"><IconButton icon="?" label="Explain this impact" /><InlineResult tone="info">UI preview only — no project data was changed.</InlineResult></div>
        </Card>

        <Card title="Empty state"><EmptyState title="No operation history" description="Approved operations will appear here when persistence is connected." /></Card>
        <Card title="Error state"><ErrorState title="Impact preview unavailable" description="Keep the source update and try again after the contract is connected." /></Card>
        <Card title="Loading skeleton"><LoadingSkeleton label="Loading project overview" /></Card>
        <Card title="Confirmation dialog" description="Cancel receives focus first; Escape closes the native dialog."><ConfirmationDialog /></Card>
      </div>
    </div>
  );
}
