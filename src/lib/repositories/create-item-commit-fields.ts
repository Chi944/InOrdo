import type { CreateItemCommitField } from "@/app/app/impact-workflow-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isItemStatus(value: unknown): value is string {
  return (
    value === "not_started" ||
    value === "in_progress" ||
    value === "blocked" ||
    value === "at_risk" ||
    value === "completed" ||
    value === "cancelled"
  );
}

function fieldsFromCreatePayload(
  payload: Record<string, unknown>,
  status: unknown,
): CreateItemCommitField[] {
  const itemType = payload.item_type;
  const title = payload.title;
  const description = payload.description;
  const priority = payload.priority;
  const ownerId = payload.owner_id;
  const startDate = payload.start_date;
  const dueDate = payload.due_date;

  if (
    (itemType !== "task" && itemType !== "risk") ||
    typeof title !== "string" ||
    title.trim().length === 0 ||
    !isNullableString(description) ||
    !isItemStatus(status) ||
    (priority !== "low" &&
      priority !== "medium" &&
      priority !== "high" &&
      priority !== "critical") ||
    !isNullableString(ownerId) ||
    !isNullableString(startDate) ||
    !isNullableString(dueDate)
  ) {
    return [];
  }

  return [
    { field: "item_type", value: itemType },
    { field: "title", value: title },
    { field: "description", value: description },
    { field: "status", value: status },
    { field: "priority", value: priority },
    { field: "owner_id", value: ownerId },
    { field: "start_date", value: startDate },
    { field: "due_date", value: dueDate },
  ];
}

export function createItemProposalCommitFields(
  payload: unknown,
): CreateItemCommitField[] {
  return isRecord(payload)
    ? fieldsFromCreatePayload(payload, "not_started")
    : [];
}

export function createItemReceiptCommitFields(
  afterState: unknown,
): CreateItemCommitField[] {
  if (
    !isRecord(afterState) ||
    afterState.receipt_version !== 2 ||
    !isRecord(afterState.create_payload)
  ) {
    return [];
  }

  return fieldsFromCreatePayload(
    afterState.create_payload,
    afterState.create_payload.status,
  );
}
