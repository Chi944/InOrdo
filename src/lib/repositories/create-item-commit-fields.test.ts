import { describe, expect, it } from "vitest";

import {
  createItemProposalCommitFields,
  createItemReceiptCommitFields,
} from "@/lib/repositories/create-item-commit-fields";

const expectedFields = [
  { field: "item_type", value: "task" },
  { field: "title", value: "Reconfirm catering" },
  {
    field: "description",
    value: "Call the venue before the supplier cutoff.",
  },
  { field: "status", value: "not_started" },
  { field: "priority", value: "high" },
  {
    field: "owner_id",
    value: "6519012e-13a6-4e3e-9ae5-d09bd3054401",
  },
  { field: "start_date", value: "2026-08-01" },
  { field: "due_date", value: "2026-08-05" },
] as const;

const createPayload = {
  item_type: "task",
  title: "Reconfirm catering",
  description: "Call the venue before the supplier cutoff.",
  priority: "high",
  owner_id: "6519012e-13a6-4e3e-9ae5-d09bd3054401",
  start_date: "2026-08-01",
  due_date: "2026-08-05",
};

describe("create item commit fields", () => {
  it("maps every proposal-controlled field plus the fixed initial status", () => {
    expect(createItemProposalCommitFields(createPayload)).toEqual(
      expectedFields,
    );
  });

  it("reads only a complete version 2 create receipt", () => {
    expect(
      createItemReceiptCommitFields({
        receipt_version: 2,
        item_id: "21d4e760-f552-43d4-bf6a-000000000003",
        item_key: "TSK-11",
        version: 1,
        create_payload: { ...createPayload, status: "not_started" },
      }),
    ).toEqual(expectedFields);

    expect(
      createItemReceiptCommitFields({
        item_id: "21d4e760-f552-43d4-bf6a-000000000003",
        item_key: "TSK-11",
        item_type: "task",
        version: 1,
      }),
    ).toEqual([]);
    expect(
      createItemReceiptCommitFields({
        receipt_version: 2,
        create_payload: { ...createPayload, status: "blocked" },
      }),
    ).toEqual(
      expectedFields.map((field) =>
        field.field === "status" ? { ...field, value: "blocked" } : field,
      ),
    );
    expect(
      createItemReceiptCommitFields({
        receipt_version: 2,
        create_payload: { ...createPayload, status: "invalid_status" },
      }),
    ).toEqual([]);
  });
});
