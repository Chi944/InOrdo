import "server-only";

import { z, type ZodType } from "zod";

import type { ProjectRecordStore } from "@/features/project-records/contracts";
import { mapProjectRecordDatabaseError } from "@/features/project-records/errors";
import type {
  CreateProjectItemInput,
  UpdateProjectItemInput,
} from "@/features/project-records/schemas";
import type { ServerSupabaseClient } from "@/lib/supabase/server";

export const projectRecordItemSelector =
  "id,workspace_id,project_id,item_key,item_type,title,description,status,priority,owner_id,start_date,due_date,event_date,metadata,version,is_demo_retired,created_by,created_at,updated_at" as const;

export const dependencyRecordSelector =
  "id,workspace_id,project_id,from_item_id,to_item_id,relationship,rationale,created_by,created_at" as const;

const itemTypes = [
  "task",
  "milestone",
  "decision",
  "event",
  "risk",
  "artifact",
] as const;
const itemStatuses = [
  "not_started",
  "in_progress",
  "blocked",
  "at_risk",
  "completed",
  "cancelled",
] as const;
const itemPriorities = ["low", "medium", "high", "critical"] as const;
const dependencyRelationships = [
  "depends_on",
  "requires",
  "informs",
  "scheduled_by",
] as const;

const projectItemRowSchema = z.strictObject({
  id: z.uuid(),
  workspace_id: z.uuid(),
  project_id: z.uuid(),
  item_key: z.string().min(4).max(64),
  item_type: z.enum(itemTypes),
  title: z.string().min(1).max(240),
  description: z.string().nullable(),
  status: z.enum(itemStatuses),
  priority: z.enum(itemPriorities),
  owner_id: z.uuid().nullable(),
  start_date: z.iso.date().nullable(),
  due_date: z.iso.date().nullable(),
  event_date: z.iso.date().nullable(),
  metadata: z.json(),
  version: z.number().int().positive(),
  is_demo_retired: z.boolean(),
  created_by: z.uuid(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const dependencyRowSchema = z.strictObject({
  id: z.uuid(),
  workspace_id: z.uuid(),
  project_id: z.uuid(),
  from_item_id: z.uuid(),
  to_item_id: z.uuid(),
  relationship: z.enum(dependencyRelationships),
  rationale: z.string().nullable(),
  created_by: z.uuid(),
  created_at: z.string().min(1),
});

const mutationStatusSchema = z.enum(["succeeded", "duplicate"]);
const workflowGenerationSchema = z
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER);
const itemMutationResultSchema = z.strictObject({
  status: mutationStatusSchema,
  workflow_generation: workflowGenerationSchema,
  item: projectItemRowSchema,
});
const dependencyMutationResultSchema = z.strictObject({
  status: mutationStatusSchema,
  workflow_generation: workflowGenerationSchema,
  dependency: dependencyRowSchema,
});
const removeDependencyResultSchema = z.strictObject({
  status: mutationStatusSchema,
  workflow_generation: workflowGenerationSchema,
  dependency_id: z.uuid(),
});

type RpcResult = {
  data: unknown;
  error: {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
  } | null;
};

async function executeMutationRpc<Result>(
  request: PromiseLike<RpcResult>,
  schema: ZodType<Result>,
): Promise<Result> {
  const { data, error } = await request;
  if (error) throw mapProjectRecordDatabaseError(error);

  const parsed = schema.safeParse(data);
  if (!parsed.success) throw mapProjectRecordDatabaseError({});
  return parsed.data;
}

function createItemPayload(input: CreateProjectItemInput) {
  return {
    item_key: input.itemKey,
    item_type: input.itemType,
    title: input.title,
    description: input.description ?? null,
    status: input.status,
    priority: input.priority,
    owner_id: input.ownerId ?? null,
    start_date: input.startDate ?? null,
    due_date: input.dueDate ?? null,
    event_date: input.eventDate ?? null,
  };
}

function updateItemPatch(input: UpdateProjectItemInput) {
  const patch: Record<string, string | null> = {};
  if (input.itemKey !== undefined) patch.item_key = input.itemKey;
  if (input.itemType !== undefined) patch.item_type = input.itemType;
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.ownerId !== undefined) patch.owner_id = input.ownerId;
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.dueDate !== undefined) patch.due_date = input.dueDate;
  if (input.eventDate !== undefined) patch.event_date = input.eventDate;
  return patch;
}

function escapeLike(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export function createSupabaseProjectRecordStore(
  client: ServerSupabaseClient,
): ProjectRecordStore {
  return {
    async createItem(scope, input) {
      const result = await executeMutationRpc(
        client.rpc("mutate_project_item_create", {
          p_project_id: scope.projectId,
          p_expected_workflow_generation: input.expectedWorkflowGeneration,
          p_idempotency_key: input.idempotencyKey,
          p_payload: createItemPayload(input),
        }),
        itemMutationResultSchema,
      );
      return {
        status: result.status,
        workflowGeneration: result.workflow_generation,
        record: result.item,
      };
    },

    async updateItem(scope, input) {
      const result = await executeMutationRpc(
        client.rpc("mutate_project_item_update", {
          p_project_id: scope.projectId,
          p_item_id: input.itemId,
          p_expected_version: input.expectedVersion,
          p_expected_workflow_generation: input.expectedWorkflowGeneration,
          p_idempotency_key: input.idempotencyKey,
          p_patch: updateItemPatch(input),
        }),
        itemMutationResultSchema,
      );
      return {
        status: result.status,
        workflowGeneration: result.workflow_generation,
        record: result.item,
      };
    },

    async listItems(scope, filters) {
      let query = client
        .from("project_items")
        .select(projectRecordItemSelector, { count: "exact" })
        .eq("workspace_id", scope.workspaceId)
        .eq("project_id", scope.projectId)
        .eq("is_demo_retired", false);

      if (filters.status) query = query.eq("status", filters.status);
      if (filters.itemType) query = query.eq("item_type", filters.itemType);
      if (filters.priority) query = query.eq("priority", filters.priority);
      if (filters.ownerId) query = query.eq("owner_id", filters.ownerId);
      if (filters.search) {
        query = query.ilike("title", `%${escapeLike(filters.search)}%`);
      }
      if (filters.cursor) query = query.gt("item_key", filters.cursor);

      const { data, error, count } = await query
        .order("item_key")
        .order("id")
        .limit(filters.limit + 1);

      if (error) throw mapProjectRecordDatabaseError(error);

      const rows = data ?? [];
      const hasMore = rows.length > filters.limit;
      const items = rows.slice(0, filters.limit);

      return {
        items,
        total: count ?? 0,
        nextCursor: hasMore ? (items.at(-1)?.item_key ?? null) : null,
      };
    },

    async createDependency(scope, input) {
      const result = await executeMutationRpc(
        client.rpc("mutate_project_dependency_create", {
          p_project_id: scope.projectId,
          p_expected_workflow_generation: input.expectedWorkflowGeneration,
          p_idempotency_key: input.idempotencyKey,
          p_payload: {
            from_item_id: input.fromItemId,
            to_item_id: input.toItemId,
            relationship: input.relationship,
            rationale: input.rationale ?? null,
          },
        }),
        dependencyMutationResultSchema,
      );
      return {
        status: result.status,
        workflowGeneration: result.workflow_generation,
        record: result.dependency,
      };
    },

    async removeDependency(scope, input) {
      const result = await executeMutationRpc(
        client.rpc("mutate_project_dependency_remove", {
          p_project_id: scope.projectId,
          p_dependency_id: input.dependencyId,
          p_expected_workflow_generation: input.expectedWorkflowGeneration,
          p_idempotency_key: input.idempotencyKey,
        }),
        removeDependencyResultSchema,
      );
      return {
        status: result.status,
        workflowGeneration: result.workflow_generation,
        dependencyId: result.dependency_id,
      };
    },

    async listDependencies(scope) {
      const { data, error } = await client
        .from("item_dependencies")
        .select(dependencyRecordSelector)
        .eq("workspace_id", scope.workspaceId)
        .eq("project_id", scope.projectId)
        .order("created_at")
        .order("id")
        .limit(500);

      if (error) throw mapProjectRecordDatabaseError(error);
      return data ?? [];
    },
  };
}
