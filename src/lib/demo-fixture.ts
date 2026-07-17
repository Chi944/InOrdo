/**
 * Synthetic UX fixture for the InOrdo demo shell.
 * This data is local, fictional, and is not returned by a backend.
 */

export type ProjectRecordType =
  | "task"
  | "milestone"
  | "decision"
  | "event"
  | "risk"
  | "artifact";

export type DisplayStatus =
  | "on-track"
  | "blocked"
  | "needs-review"
  | "proposed"
  | "complete"
  | "open";

export type ProjectRecord = {
  id: string;
  type: ProjectRecordType;
  title: string;
  owner: string;
  state: string;
  date?: string;
};

export type TeamMember = {
  name: string;
  initials: string;
  role: string;
};

export type Milestone = {
  id: string;
  title: string;
  date: string;
  owner: string;
  status: DisplayStatus;
  statusLabel: string;
};

export type Risk = {
  id: string;
  title: string;
  owner: string;
  severity: "Medium" | "High";
  status: DisplayStatus;
  statusLabel: string;
};

export type Impact = {
  id: string;
  title: string;
  reason: string;
  path: string;
};

export type RecoveryAction = {
  id: string;
  label: string;
  owner: string;
  previewState: "selected" | "unapproved";
  rationale?: string;
};

const records: readonly ProjectRecord[] = [
  { id: "EVT-01", type: "event", title: "Regional Climate Action Summit 2026", owner: "Mei Lin", state: "Scheduled", date: "12 Sep 2026" },
  { id: "M-01", type: "milestone", title: "Venue contract confirmed", owner: "Aisha", state: "Complete", date: "3 Aug 2026" },
  { id: "M-02", type: "milestone", title: "Programme locked", owner: "Javier", state: "Needs review", date: "17 Aug 2026" },
  { id: "M-03", type: "milestone", title: "Registration closes", owner: "Nandita", state: "Needs review", date: "5 Sep 2026" },
  { id: "M-04", type: "milestone", title: "Final run-of-show approved", owner: "Mei Lin", state: "Needs review", date: "9 Sep 2026" },
  { id: "DEC-01", type: "decision", title: "Run a one-day hybrid summit", owner: "Mei Lin", state: "Approved" },
  { id: "DEC-02", type: "decision", title: "Provide capped student travel support", owner: "Priya", state: "Approved" },
  { id: "DEC-03", type: "decision", title: "Hold the summit on 12 Sep 2026", owner: "Mei Lin", state: "Approved" },
  { id: "RISK-01", type: "risk", title: "Venue availability may change", owner: "Aisha", state: "Open · Medium" },
  { id: "RISK-02", type: "risk", title: "Travel changes after vendor cutoff incur fees", owner: "Priya", state: "Open · High" },
  { id: "RISK-03", type: "risk", title: "Rescheduled speakers may be unavailable", owner: "Javier", state: "Open · Medium" },
  { id: "ART-01", type: "artifact", title: "Signed venue agreement", owner: "Aisha", state: "Linked" },
  { id: "ART-02", type: "artifact", title: "Save-the-date announcement", owner: "Nandita", state: "Published" },
  { id: "ART-03", type: "artifact", title: "Registration page", owner: "Lucas", state: "Published" },
  { id: "ART-04", type: "artifact", title: "Speaker briefing pack", owner: "Javier", state: "Draft" },
  { id: "ART-05", type: "artifact", title: "Volunteer shift roster", owner: "Samuel", state: "Draft" },
  { id: "TASK-01", type: "task", title: "Confirm venue access and event date", owner: "Aisha", state: "Complete" },
  { id: "TASK-02", type: "task", title: "Publish attendee registration", owner: "Nandita", state: "Complete" },
  { id: "TASK-03", type: "task", title: "Confirm speaker availability", owner: "Javier", state: "In progress" },
  { id: "TASK-04", type: "task", title: "Book supported student travel", owner: "Priya", state: "In progress" },
  { id: "TASK-05", type: "task", title: "Recruit and schedule volunteers", owner: "Samuel", state: "In progress" },
  { id: "TASK-06", type: "task", title: "Prepare press and partner kit", owner: "Nandita", state: "In progress" },
  { id: "TASK-07", type: "task", title: "Confirm catering headcount and service date", owner: "Aisha", state: "Planned" },
  { id: "TASK-08", type: "task", title: "Run livestream and accessibility rehearsal", owner: "Lucas", state: "Planned", date: "9 Sep 2026" },
] as const;

const team: readonly TeamMember[] = [
  { name: "Mei Lin Tan", initials: "MT", role: "Summit director" },
  { name: "Javier Reyes", initials: "JR", role: "Programme lead" },
  { name: "Aisha Rahman", initials: "AR", role: "Venue and operations" },
  { name: "Daniel Cho", initials: "DC", role: "Partnerships lead" },
  { name: "Nandita Rao", initials: "NR", role: "Communications lead" },
  { name: "Samuel Okafor", initials: "SO", role: "Volunteer lead" },
  { name: "Priya Nair", initials: "PN", role: "Finance and risk" },
  { name: "Lucas Wong", initials: "LW", role: "Digital experience" },
] as const;

const milestones: readonly Milestone[] = [
  { id: "M-01", title: "Venue contract confirmed", date: "3 Aug 2026", owner: "Aisha", status: "blocked", statusLabel: "Blocked by date change" },
  { id: "M-02", title: "Programme locked", date: "17 Aug 2026", owner: "Javier", status: "needs-review", statusLabel: "Needs review" },
  { id: "M-03", title: "Registration closes", date: "5 Sep 2026", owner: "Nandita", status: "needs-review", statusLabel: "Needs review" },
  { id: "M-04", title: "Final run-of-show approved", date: "9 Sep 2026", owner: "Mei Lin", status: "proposed", statusLabel: "Proposed move" },
] as const;

const risks: readonly Risk[] = [
  { id: "RISK-01", title: "Venue availability may change", owner: "Aisha", severity: "Medium", status: "open", statusLabel: "Open" },
  { id: "RISK-02", title: "Travel changes after vendor cutoff incur fees", owner: "Priya", severity: "High", status: "blocked", statusLabel: "Blocked" },
  { id: "RISK-03", title: "Rescheduled speakers may be unavailable", owner: "Javier", severity: "Medium", status: "needs-review", statusLabel: "Needs review" },
] as const;

const directImpacts: readonly Impact[] = [
  { id: "M-03", title: "Registration close", reason: "The close date is anchored to the summit date.", path: "EVT-01 → M-03" },
  { id: "ART-02", title: "Save-the-date announcement", reason: "The published artifact contains the original date.", path: "EVT-01 → ART-02" },
  { id: "TASK-03", title: "Speaker availability", reason: "Speakers were confirmed against the original date.", path: "EVT-01 → TASK-03" },
  { id: "TASK-04", title: "Student travel", reason: "Bookings and vendor cutoffs depend on the event date.", path: "EVT-01 → TASK-04" },
  { id: "TASK-05", title: "Volunteer scheduling", reason: "Shift planning is tied to the event date.", path: "EVT-01 → TASK-05" },
  { id: "TASK-06", title: "Press and partner kit", reason: "Campaign material must use the current event date.", path: "EVT-01 → TASK-06" },
  { id: "TASK-07", title: "Catering service", reason: "The catering service date must match the event.", path: "EVT-01 → TASK-07" },
  { id: "TASK-08", title: "Technical rehearsal", reason: "The rehearsal is scheduled relative to the event.", path: "EVT-01 → TASK-08" },
  { id: "RISK-03", title: "Speaker conflict risk", reason: "A new date changes the availability risk.", path: "EVT-01 → RISK-03" },
] as const;

const indirectImpacts: readonly Impact[] = [
  { id: "TASK-02", title: "Attendee registration", reason: "The registration task follows the date-anchored close milestone.", path: "EVT-01 → M-03 → TASK-02" },
  { id: "ART-03", title: "Registration page", reason: "The registration path inherits the changed date.", path: "EVT-01 → M-03 → TASK-02 → ART-03" },
  { id: "M-02", title: "Programme lock", reason: "The programme can only lock after speaker availability is reconfirmed.", path: "EVT-01 → TASK-03 → M-02" },
  { id: "ART-04", title: "Speaker briefing pack", reason: "The pack follows speaker confirmation and programme lock.", path: "EVT-01 → TASK-03 → M-02 → ART-04" },
  { id: "RISK-02", title: "Travel change fees", reason: "Travel review may activate the vendor-cutoff risk.", path: "EVT-01 → TASK-04 → RISK-02" },
  { id: "ART-05", title: "Volunteer shift roster", reason: "The roster follows volunteer scheduling.", path: "EVT-01 → TASK-05 → ART-05" },
  { id: "M-04", title: "Final run-of-show", reason: "The approval milestone follows the technical rehearsal.", path: "EVT-01 → TASK-08 → M-04" },
] as const;

const recoveryActions: readonly RecoveryAction[] = [
  { id: "REC-01", label: "Change the summit date to 26 Sep 2026", owner: "Mei Lin", previewState: "selected" },
  { id: "REC-02", label: "Move registration close to 19 Sep 2026", owner: "Nandita", previewState: "selected" },
  { id: "REC-03", label: "Update published date artifacts", owner: "Nandita", previewState: "selected" },
  { id: "REC-04", label: "Add a speaker reconfirmation step", owner: "Javier", previewState: "selected" },
  { id: "REC-05", label: "Rebook supported student travel", owner: "Priya", previewState: "unapproved", rationale: "Cost and participant consequences require Priya's review." },
  { id: "REC-06", label: "Move volunteer shifts to 26 Sep", owner: "Samuel", previewState: "selected" },
  { id: "REC-07", label: "Update press, partner, and catering dates", owner: "Aisha · Nandita", previewState: "selected" },
  { id: "REC-08", label: "Move rehearsal and run-of-show approval", owner: "Lucas · Mei Lin", previewState: "selected" },
  { id: "REC-09", label: "Reassess speaker conflict risk", owner: "Javier", previewState: "selected" },
] as const;

export const demoFixture = {
  fixtureLabel: "Synthetic demo workspace",
  workspace: "Inter-University Environmental Coalition",
  project: "Regional Climate Action Summit 2026",
  projectCode: "CLIMATE-SUMMIT-26",
  originalDate: "12 September 2026",
  proposedDate: "26 September 2026",
  reviewStatus: "Impact review pending",
  evidence: {
    title: "Venue update",
    source: "Campus convention hall team",
    received: "20 July 2026",
    text: "Venue update — 20 July 2026: The campus convention hall is unavailable on 12 September 2026. The venue team has offered 26 September 2026 instead, so the Regional Climate Action Summit must move from 12 September 2026 to 26 September 2026. All other venue terms remain unchanged.",
    extraction: {
      record: "EVT-01 — Regional Climate Action Summit 2026",
      property: "Event date",
      previousValue: "12 Sep 2026",
      newValue: "26 Sep 2026",
      reason: "Venue unavailable on the original date",
      state: "Needs human confirmation",
    },
  },
  records,
  team,
  milestones,
  risks,
  directImpacts,
  indirectImpacts,
  recoveryActions,
  dependencyPathCount: 22,
  history: [] as const,
} as const;

export const demoSummary = {
  updatesAwaitingReview: 1,
  recordCount: demoFixture.records.length,
  directImpactCount: demoFixture.directImpacts.length,
  indirectImpactCount: demoFixture.indirectImpacts.length,
  openRiskCount: demoFixture.risks.length,
} as const;
