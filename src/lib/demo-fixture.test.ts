import { describe, expect, it } from "vitest";

import { demoFixture, demoSummary } from "@/lib/demo-fixture";

describe("synthetic summit fixture", () => {
  it("keeps the documented baseline complete and internally consistent", () => {
    expect(demoFixture.fixtureLabel).toBe("Synthetic demo workspace");
    expect(demoFixture.records).toHaveLength(24);
    expect(demoFixture.team).toHaveLength(8);
    expect(demoFixture.history).toEqual([]);
    expect(new Set(demoFixture.records.map((record) => record.id)).size).toBe(24);
    expect(new Set(demoFixture.records.map((record) => record.type))).toEqual(
      new Set(["task", "milestone", "decision", "event", "risk", "artifact"]),
    );
  });

  it("preserves the exact venue update and review boundary", () => {
    expect(demoFixture.evidence.text).toContain(
      "unavailable on 12 September 2026",
    );
    expect(demoFixture.evidence.text).toContain(
      "offered 26 September 2026 instead",
    );
    expect(demoFixture.evidence.text).toContain(
      "All other venue terms remain unchanged",
    );
    expect(demoFixture.evidence.extraction.state).toBe(
      "Needs human confirmation",
    );
  });

  it("derives impact counts and holds only travel rebooking", () => {
    expect(demoSummary.directImpactCount).toBe(9);
    expect(demoSummary.indirectImpactCount).toBe(7);
    expect(demoFixture.indirectImpacts.map((impact) => impact.id)).toEqual([
      "TASK-02",
      "ART-03",
      "M-02",
      "ART-04",
      "RISK-02",
      "ART-05",
      "M-04",
    ]);

    const held = demoFixture.recoveryActions.filter(
      (action) => action.previewState === "unapproved",
    );
    expect(held).toHaveLength(1);
    expect(held[0]?.id).toBe("REC-05");
  });
});
