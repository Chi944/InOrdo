# Demo scenario: Regional Climate Action Summit 2026

## Fixture status

Everything in this document is **synthetic demo fixture data**. The coalition, people, workspace, records, dates, and updates are fictional and contain no private data. The fixture exists to demonstrate InOrdo's evidence -> impact -> approval -> undo workflow; it is not a customer account or evidence of a live integration.

## Workspace

**Inter-University Environmental Coalition — Regional Climate Action Summit 2026**

The coalition is a fictional eight-person student team coordinating a one-day regional summit. Its plan combines event, programme, communications, partnerships, volunteer, travel, finance, and technical work. The baseline summit date is **12 September 2026**.

## Fictional team

| Person | Role | Demo responsibility |
| --- | --- | --- |
| Mei Lin Tan | Summit director | Overall delivery and final approvals |
| Javier Reyes | Programme lead | Agenda, speakers, and session content |
| Aisha Rahman | Venue and operations lead | Venue, catering, and event logistics |
| Daniel Cho | Partnerships lead | Partner commitments and sponsor coordination |
| Nandita Rao | Communications lead | Registration, media, and attendee updates |
| Samuel Okafor | Volunteer lead | Volunteer recruitment, shifts, and briefing |
| Priya Nair | Finance and risk lead | Budget, travel support, and risk review |
| Lucas Wong | Digital experience lead | Registration flow, livestream, and technical rehearsal |

## Seeded records

| ID | Type | Record | Owner | Baseline state or date |
| --- | --- | --- | --- | --- |
| EVT-01 | Event | Regional Climate Action Summit 2026 | Mei Lin | 12 Sep 2026 |
| M-01 | Milestone | Venue contract confirmed | Aisha | 3 Aug 2026 |
| M-02 | Milestone | Programme locked | Javier | 17 Aug 2026 |
| M-03 | Milestone | Registration closes | Nandita | 5 Sep 2026 |
| M-04 | Milestone | Final run-of-show approved | Mei Lin | 9 Sep 2026 |
| DEC-01 | Decision | Run a one-day hybrid summit | Mei Lin | Approved |
| DEC-02 | Decision | Provide capped student travel support | Priya | Approved |
| DEC-03 | Decision | Hold the summit on 12 Sep 2026 | Mei Lin | Approved |
| RISK-01 | Risk | Venue availability may change | Aisha | Open; medium |
| RISK-02 | Risk | Travel changes after vendor cutoff incur fees | Priya | Open; high |
| RISK-03 | Risk | Rescheduled speakers may be unavailable | Javier | Open; medium |
| ART-01 | Artifact | Signed venue agreement | Aisha | Linked to venue confirmation |
| ART-02 | Artifact | Save-the-date announcement | Nandita | Published with 12 Sep date |
| ART-03 | Artifact | Registration page | Lucas | Published with 12 Sep date |
| ART-04 | Artifact | Speaker briefing pack | Javier | Draft references 12 Sep date |
| ART-05 | Artifact | Volunteer shift roster | Samuel | Draft uses 12 Sep shifts |
| TASK-01 | Task | Confirm venue access and event date | Aisha | Complete |
| TASK-02 | Task | Publish attendee registration | Nandita | Complete |
| TASK-03 | Task | Confirm speaker availability | Javier | In progress |
| TASK-04 | Task | Book supported student travel | Priya | In progress |
| TASK-05 | Task | Recruit and schedule volunteers | Samuel | In progress |
| TASK-06 | Task | Prepare press and partner kit | Nandita | In progress |
| TASK-07 | Task | Confirm catering headcount and service date | Aisha | Planned |
| TASK-08 | Task | Run livestream and accessibility rehearsal | Lucas | Planned for 9 Sep 2026 |

The fixture contains 24 records across all six P0 record types: task, milestone, decision, event, risk, and artifact.

## Explicit dependencies

Each arrow means the record on the right depends on the record on the left.

- `TASK-01 -> M-01 -> ART-01`
- `M-01 -> DEC-03 -> EVT-01`
- `EVT-01 -> M-03 -> TASK-02 -> ART-03`
- `EVT-01 -> ART-02`
- `EVT-01 -> TASK-03 -> M-02 -> ART-04`
- `EVT-01 -> TASK-04`; `DEC-02 -> TASK-04`; `TASK-04 -> RISK-02`
- `EVT-01 -> TASK-05 -> ART-05`
- `EVT-01 -> TASK-06`
- `EVT-01 -> TASK-07`
- `EVT-01 -> TASK-08 -> M-04`
- `RISK-01 -> TASK-01`
- `EVT-01 -> RISK-03`

This graph is intentionally small enough to explain during a demo but rich enough to show direct and multi-hop impact.

## Exact source update

The presenter pastes this text as new evidence:

> Venue update — 20 July 2026: The campus convention hall is unavailable on 12 September 2026. The venue team has offered 26 September 2026 instead, so the Regional Climate Action Summit must move from 12 September 2026 to 26 September 2026. All other venue terms remain unchanged.

## Expected structured change

The expected extraction is a reviewable interpretation, not an automatic mutation:

| Field | Expected value |
| --- | --- |
| Record | `EVT-01 — Regional Climate Action Summit 2026` |
| Property | `event_date` |
| Previous value | `2026-09-12` |
| New value | `2026-09-26` |
| Reason | Venue unavailable on the original date |
| Evidence date | `2026-07-20` |
| Unchanged constraint | All other venue terms |
| Review state | Needs human confirmation |

GPT-5.6's meaningful P0 role is to turn the pasted prose into this structured candidate change. The application must preserve and display the original text so a reviewer can correct or reject the extraction.

## Expected impact review

### Direct impacts

The deterministic graph should identify records with an explicit dependency on `EVT-01`:

- `M-03` — registration close date may no longer fit the event timeline.
- `ART-02` — save-the-date contains the old date.
- `TASK-03` — speaker availability must be reconfirmed.
- `TASK-04` — supported student travel must be checked against the new date.
- `TASK-05` — volunteer scheduling is tied to the event date.
- `TASK-06` — the press and partner kit must use the new date.
- `TASK-07` — catering service date must be updated.
- `TASK-08` — rehearsal timing must move relative to the event.
- `RISK-03` — speaker conflict risk should be reassessed.

### Indirect impacts

The graph should then traverse explicit downstream paths:

- `TASK-02` and `ART-03` through `EVT-01 -> M-03 -> TASK-02 -> ART-03`.
- `M-02` and `ART-04` through `EVT-01 -> TASK-03 -> M-02 -> ART-04`.
- `RISK-02` through `EVT-01 -> TASK-04 -> RISK-02`.
- `ART-05` through `EVT-01 -> TASK-05 -> ART-05`.
- `M-04` through `EVT-01 -> TASK-08 -> M-04`.

`DEC-02`, `RISK-01`, `TASK-01`, `M-01`, and `ART-01` should not be marked as date-change impacts merely because they exist in the workspace. The source explicitly says other venue terms remain unchanged, and graph direction must be respected.

## Expected recovery proposal

The proposed actions remain pending until separately approved:

1. Change `EVT-01` from 12 Sep to 26 Sep 2026.
2. Move `M-03` registration close from 5 Sep to 19 Sep 2026.
3. Update the date shown in `ART-02` and `ART-03`.
4. Add a reconfirmation step to `TASK-03` for every speaker.
5. Ask Priya to review travel bookings and `RISK-02` before changing reservations.
6. Move the volunteer shift date in `ART-05` to 26 Sep 2026, subject to volunteer confirmation.
7. Update `TASK-06` and `TASK-07` to use the new event date.
8. Move `TASK-08` and `M-04` to 23 Sep 2026.
9. Reassess `RISK-03` after speaker responses are received.

### Deliberately unapproved action

Action 5 — changing or rebooking student travel — remains **unapproved** in the judge demo. It has cost and participant consequences that require Priya's review. This demonstrates that InOrdo does not treat a generated recovery plan as permission to act.

## Reset baseline

Reset restores the fixture to:

- event date `12 Sep 2026`;
- the 24 seeded records and dependency edges listed above;
- the pasted source update absent;
- no extracted candidate change;
- no impact review or recovery proposal;
- no approved actions, operation history entries, or undo state;
- original milestone and artifact dates and statuses;
- the same eight fictional team members.

Reset must be deterministic and clearly labeled as a demo-only operation.

## Judge-facing walkthrough

1. **Orient (15 seconds).** Open the project dashboard. Point out the synthetic label, eight-person team, summit date, milestones, risks, and explicit project relationships.
2. **Introduce evidence (20 seconds).** Paste or reveal the exact venue update. Emphasize that InOrdo preserves the source.
3. **Review extraction (20 seconds).** Show the old date, new date, reason, and `Needs human confirmation` state. State that GPT-5.6 structures the text but does not update project records.
4. **Review impact (30 seconds).** Show direct impacts first, then one multi-hop path such as event -> speaker confirmation -> programme lock -> briefing pack. State that graph traversal, not the model, determines reach.
5. **Review proposal (30 seconds).** Compare proposed actions with their evidence and paths. Approve low-risk date and content changes individually; leave travel rebooking unapproved.
6. **Show history and undo (20 seconds).** Open the operation record for an approved action and demonstrate undo only if the action is verified in the current build. Otherwise identify the screen as a verification point rather than claiming it works.
7. **Reset and close (15 seconds).** Restore the fixture baseline if reset is verified. Close with the sequence: evidence, impact, approval, undo.
