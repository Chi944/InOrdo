import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createSupabaseProjectRecordStore } from "@/features/project-records/supabase-store";
import type { AuthorizedProjectScope } from "@/lib/auth/guards";
import type { ServerSupabaseClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

const workspaceId = "166645ec-1ab3-48dc-98c7-3b6f99b70301";
const projectId = "8d2baf13-b687-4987-83a0-0b1294b0f001";
const userId = "6519012e-13a6-4e3e-9ae5-d09bd3054401";
const itemId = "3e14b4a4-421d-4d6d-8a7e-01d5a22e3002";
const upstreamId = "b993a2d1-8060-4c96-a7d0-e79f4cd43303";
const dependencyId = "4db0760c-d441-4b39-845d-f011b3e14404";

const scope: AuthorizedProjectScope = {
  workspaceId,
  projectId,
  membership: { workspaceId, userId, role: "member" },
};

const itemRow: Tables<"project_items"> = {
  id: itemId,
  workspace_id: workspaceId,
  project_id: projectId,
  item_key: "OPS-12",
  item_type: "task",
  title: "Confirm venue",
  description: null,
  status: "not_started",
  priority: "medium",
  owner_id: null,
  start_date: null,
  due_date: null,
  event_date: null,
  metadata: {},
  version: 2,
  is_demo_retired: false,
  created_by: userId,
  created_at: "2026-07-18T00:00:00.000Z",
  updated_at: "2026-07-18T00:00:00.000Z",
};

const dependencyRow: Tables<"item_dependencies"> = {
  id: dependencyId,
  workspace_id: workspaceId,
  project_id: projectId,
  from_item_id: itemId,
  to_item_id: upstreamId,
  relationship: "requires",
  rationale: null,
  created_by: userId,
  created_at: "2026-07-18T00:00:00.000Z",
};

type RpcResult = {
  data: unknown;
  error: { code?: string | null; message?: string | null } | null;
};

function makeRpcStore(result: RpcResult) {
  const rpc = vi.fn(async () => result);
  const client = { rpc } as unknown as ServerSupabaseClient;
  return { rpc, store: createSupabaseProjectRecordStore(client) };
}

describe("Supabase project record mutation RPCs", () => {
  it("creates an item with exact generation-fenced RPC arguments", async () => {
    const { rpc, store } = makeRpcStore({
      data: {
        status: "duplicate",
        workflow_generation: 7,
        item: itemRow,
      },
      error: null,
    });

    await expect(
      store.createItem(scope, {
        projectId,
        expectedWorkflowGeneration: 7,
        idempotencyKey: "item-create-20260719",
        itemKey: "OPS-12",
        itemType: "task",
        title: "Confirm venue",
        description: undefined,
        status: "not_started",
        priority: "medium",
        ownerId: undefined,
        startDate: undefined,
        dueDate: undefined,
        eventDate: undefined,
      }),
    ).resolves.toEqual({
      status: "duplicate",
      workflowGeneration: 7,
      record: itemRow,
    });
    expect(rpc).toHaveBeenCalledWith("mutate_project_item_create", {
      p_project_id: projectId,
      p_expected_workflow_generation: 7,
      p_idempotency_key: "item-create-20260719",
      p_payload: {
        item_key: "OPS-12",
        item_type: "task",
        title: "Confirm venue",
        description: null,
        status: "not_started",
        priority: "medium",
        owner_id: null,
        start_date: null,
        due_date: null,
        event_date: null,
      },
    });
  });

  it("updates an item with only the allowlisted patch fields", async () => {
    const updatedItem = {
      ...itemRow,
      item_key: "OPS-13",
      item_type: "event" as const,
      title: "Confirm revised venue",
      event_date: "2026-08-03",
      version: 3,
    };
    const { rpc, store } = makeRpcStore({
      data: {
        status: "succeeded",
        workflow_generation: 7,
        item: updatedItem,
      },
      error: null,
    });

    await expect(
      store.updateItem(scope, {
        projectId,
        itemId,
        expectedVersion: 2,
        expectedWorkflowGeneration: 7,
        idempotencyKey: "item-update-20260719",
        itemKey: "OPS-13",
        itemType: "event",
        title: "Confirm revised venue",
        dueDate: null,
        eventDate: "2026-08-03",
      }),
    ).resolves.toMatchObject({ record: updatedItem, status: "succeeded" });
    expect(rpc).toHaveBeenCalledWith("mutate_project_item_update", {
      p_project_id: projectId,
      p_item_id: itemId,
      p_expected_version: 2,
      p_expected_workflow_generation: 7,
      p_idempotency_key: "item-update-20260719",
      p_patch: {
        item_key: "OPS-13",
        item_type: "event",
        title: "Confirm revised venue",
        due_date: null,
        event_date: "2026-08-03",
      },
    });
  });

  it("creates and removes dependencies through exact RPC arguments", async () => {
    const createRpc = makeRpcStore({
      data: {
        status: "succeeded",
        workflow_generation: 7,
        dependency: dependencyRow,
      },
      error: null,
    });
    await expect(
      createRpc.store.createDependency(scope, {
        projectId,
        expectedWorkflowGeneration: 7,
        idempotencyKey: "dependency-create-20260719",
        fromItemId: itemId,
        toItemId: upstreamId,
        relationship: "requires",
        rationale: undefined,
      }),
    ).resolves.toEqual({
      status: "succeeded",
      workflowGeneration: 7,
      record: dependencyRow,
    });
    expect(createRpc.rpc).toHaveBeenCalledWith(
      "mutate_project_dependency_create",
      {
        p_project_id: projectId,
        p_expected_workflow_generation: 7,
        p_idempotency_key: "dependency-create-20260719",
        p_payload: {
          from_item_id: itemId,
          to_item_id: upstreamId,
          relationship: "requires",
          rationale: null,
        },
      },
    );

    const removeRpc = makeRpcStore({
      data: {
        status: "duplicate",
        workflow_generation: 7,
        dependency_id: dependencyId,
      },
      error: null,
    });
    await expect(
      removeRpc.store.removeDependency(scope, {
        projectId,
        dependencyId,
        expectedWorkflowGeneration: 7,
        idempotencyKey: "dependency-remove-20260719",
      }),
    ).resolves.toEqual({
      status: "duplicate",
      workflowGeneration: 7,
      dependencyId,
    });
    expect(removeRpc.rpc).toHaveBeenCalledWith(
      "mutate_project_dependency_remove",
      {
        p_project_id: projectId,
        p_dependency_id: dependencyId,
        p_expected_workflow_generation: 7,
        p_idempotency_key: "dependency-remove-20260719",
      },
    );
  });

  it("fails closed on malformed JSONB responses", async () => {
    const { store } = makeRpcStore({
      data: { status: "succeeded", item: { id: itemId } },
      error: null,
    });

    await expect(
      store.createItem(scope, {
        projectId,
        expectedWorkflowGeneration: 7,
        idempotencyKey: "item-create-malformed",
        itemKey: "OPS-12",
        itemType: "task",
        title: "Confirm venue",
        status: "not_started",
        priority: "medium",
      }),
    ).rejects.toMatchObject({
      code: "internal",
      message: "The project record could not be saved. Please try again.",
    });
  });

  it("maps RPC conflicts without exposing database internals", async () => {
    const { store } = makeRpcStore({
      data: null,
      error: {
        code: "40001",
        message: "private idempotency ledger conflict detail",
      },
    });

    await expect(
      store.removeDependency(scope, {
        projectId,
        dependencyId,
        expectedWorkflowGeneration: 7,
        idempotencyKey: "dependency-remove-conflict",
      }),
    ).rejects.toMatchObject({
      code: "conflict",
      message:
        "This project changed while the request was in progress. Refresh and try again.",
    });
  });
});

describe("Supabase project record store access paths", () => {
  const source = readFileSync(
    resolve(process.cwd(), "src/features/project-records/supabase-store.ts"),
    "utf8",
  );

  it("uses RPCs exclusively for mutations while retaining scoped table reads", () => {
    expect(source).not.toMatch(/\.(?:insert|update|delete)\(/);
    expect(source).toContain('.from("project_items")');
    expect(source).toContain('.from("item_dependencies")');
    expect(source).toContain("mutate_project_item_create");
    expect(source).toContain("mutate_project_item_update");
    expect(source).toContain("mutate_project_dependency_create");
    expect(source).toContain("mutate_project_dependency_remove");
  });

  it("uses explicit selectors and never selects all columns", () => {
    expect(source).not.toMatch(/\.select\(\s*["'`]\s*\*/);
    expect(source).toContain('.eq("is_demo_retired", false)');
    expect(source).toContain("projectRecordItemSelector");
    expect(source).toContain("dependencyRecordSelector");
  });
});
