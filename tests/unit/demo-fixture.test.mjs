import assert from "node:assert/strict";
import test from "node:test";
import { demoFixture, demoSummary } from "../../lib/demo-fixture.ts";

test("the synthetic fixture has a stable, complete baseline", () => {
  assert.equal(demoFixture.fixtureLabel, "Synthetic demo workspace");
  assert.equal(demoFixture.records.length, 24);
  assert.equal(demoFixture.team.length, 8);
  assert.deepEqual(demoFixture.history, []);

  const ids = demoFixture.records.map((record) => record.id);
  assert.equal(new Set(ids).size, ids.length, "record IDs must be unique");
  assert.deepEqual(
    new Set(demoFixture.records.map((record) => record.type)),
    new Set(["task", "milestone", "decision", "event", "risk", "artifact"]),
  );
});

test("the venue update preserves the exact before and after dates", () => {
  assert.match(demoFixture.evidence.text, /unavailable on 12 September 2026/);
  assert.match(demoFixture.evidence.text, /offered 26 September 2026 instead/);
  assert.match(demoFixture.evidence.text, /All other venue terms remain unchanged/);
  assert.equal(demoFixture.evidence.extraction.previousValue, "12 Sep 2026");
  assert.equal(demoFixture.evidence.extraction.newValue, "26 Sep 2026");
  assert.equal(demoFixture.evidence.extraction.state, "Needs human confirmation");
});

test("impact paths reference seeded records and summary counts are derived", () => {
  const recordIds = new Set(demoFixture.records.map((record) => record.id));
  const impacts = [...demoFixture.directImpacts, ...demoFixture.indirectImpacts];

  for (const impact of impacts) {
    assert.ok(recordIds.has(impact.id), `${impact.id} must be a seeded record`);
    const pathIds = impact.path.match(/[A-Z]+-\d+/g) ?? [];
    assert.ok(pathIds.length > 0, `${impact.id} must include a dependency path`);
    for (const id of pathIds) assert.ok(recordIds.has(id), `${id} must exist in the fixture`);
  }

  assert.equal(demoSummary.recordCount, demoFixture.records.length);
  assert.equal(demoSummary.directImpactCount, demoFixture.directImpacts.length);
  assert.equal(demoSummary.indirectImpactCount, demoFixture.indirectImpacts.length);
  assert.equal(demoSummary.openRiskCount, demoFixture.risks.length);
  assert.equal(demoSummary.directImpactCount, 9);
  assert.equal(demoSummary.indirectImpactCount, 7);
  assert.deepEqual(
    demoFixture.indirectImpacts.map((impact) => impact.id),
    ["TASK-02", "ART-03", "M-02", "ART-04", "RISK-02", "ART-05", "M-04"],
  );
});

test("travel rebooking remains the only deliberately unapproved action", () => {
  const held = demoFixture.recoveryActions.filter((action) => action.previewState === "unapproved");
  assert.equal(held.length, 1);
  assert.equal(held[0]?.id, "REC-05");
  assert.match(held[0]?.rationale ?? "", /require Priya's review/);
});
