"use server";

import { revalidatePath } from "next/cache";

import type { RecordActionState } from "@/app/app/project-record-action-state";
import { createProjectRecordOperations } from "@/features/project-records/operations";
import { ProjectRecordError } from "@/features/project-records/errors";
import { AuthorizationError } from "@/lib/auth/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function stringValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function optionalString(formData: FormData, name: string) {
  const value = stringValue(formData, name);
  return value === "" ? undefined : value;
}

function nullableString(formData: FormData, name: string) {
  if (!formData.has(name)) return undefined;
  const value = stringValue(formData, name);
  return value === "" ? null : value;
}

function ambiguousActionError(): RecordActionState {
  return {
    status: "error",
    message:
      "The result could not be confirmed. Retry the unchanged form to safely check the same request.",
    idempotencyKeyDisposition: "retain",
  };
}

function actionError(error: unknown): RecordActionState {
  if (error instanceof ProjectRecordError) {
    if (error.code === "internal") return ambiguousActionError();
    if (error.code === "conflict") {
      return {
        status: "conflict",
        message: `Conflict: ${error.message}`,
        idempotencyKeyDisposition: "rotate",
      };
    }
    return {
      status: "error",
      message: error.message,
      idempotencyKeyDisposition: "rotate",
    };
  }
  if (error instanceof AuthorizationError) {
    return {
      status: "error",
      message: error.message,
      idempotencyKeyDisposition: "rotate",
    };
  }
  return ambiguousActionError();
}

async function operations() {
  const client = await createServerSupabaseClient();
  return createProjectRecordOperations({ client });
}

export async function createProjectItemAction(
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  try {
    const projectRecords = await operations();
    await projectRecords.createItem({
      projectId: stringValue(formData, "projectId"),
      expectedWorkflowGeneration: Number(
        stringValue(formData, "expectedWorkflowGeneration"),
      ),
      idempotencyKey: stringValue(formData, "idempotencyKey"),
      itemKey: stringValue(formData, "itemKey"),
      itemType: stringValue(formData, "itemType"),
      title: stringValue(formData, "title"),
      description: optionalString(formData, "description"),
      status: stringValue(formData, "status"),
      priority: stringValue(formData, "priority"),
      ownerId: optionalString(formData, "ownerId"),
      startDate: optionalString(formData, "startDate"),
      dueDate: optionalString(formData, "dueDate"),
      eventDate: optionalString(formData, "eventDate"),
    });
    revalidatePath("/app", "layout");
    return {
      status: "success",
      message: "Project item created.",
      idempotencyKeyDisposition: "rotate",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateProjectItemAction(
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  try {
    const projectRecords = await operations();
    const input = {
      projectId: stringValue(formData, "projectId"),
      itemId: stringValue(formData, "itemId"),
      expectedVersion: Number(stringValue(formData, "expectedVersion")),
      expectedWorkflowGeneration: Number(
        stringValue(formData, "expectedWorkflowGeneration"),
      ),
      idempotencyKey: stringValue(formData, "idempotencyKey"),
      ...(formData.has("itemKey") && {
        itemKey: stringValue(formData, "itemKey"),
      }),
      ...(formData.has("itemType") && {
        itemType: stringValue(formData, "itemType"),
      }),
      ...(formData.has("title") && { title: stringValue(formData, "title") }),
      ...(formData.has("description") && {
        description: nullableString(formData, "description"),
      }),
      ...(formData.has("status") && {
        status: stringValue(formData, "status"),
      }),
      ...(formData.has("priority") && {
        priority: stringValue(formData, "priority"),
      }),
      ...(formData.has("ownerId") && {
        ownerId: nullableString(formData, "ownerId"),
      }),
      ...(formData.has("startDate") && {
        startDate: nullableString(formData, "startDate"),
      }),
      ...(formData.has("dueDate") && {
        dueDate: nullableString(formData, "dueDate"),
      }),
      ...(formData.has("eventDate") && {
        eventDate: nullableString(formData, "eventDate"),
      }),
    };
    await projectRecords.updateItem(input);
    revalidatePath("/app", "layout");
    return {
      status: "success",
      message: "Project item updated.",
      idempotencyKeyDisposition: "rotate",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function createDependencyAction(
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  try {
    const projectRecords = await operations();
    await projectRecords.createDependency({
      projectId: stringValue(formData, "projectId"),
      expectedWorkflowGeneration: Number(
        stringValue(formData, "expectedWorkflowGeneration"),
      ),
      idempotencyKey: stringValue(formData, "idempotencyKey"),
      fromItemId: stringValue(formData, "fromItemId"),
      toItemId: stringValue(formData, "toItemId"),
      relationship: stringValue(formData, "relationship"),
      rationale: optionalString(formData, "rationale"),
    });
    revalidatePath("/app", "layout");
    return {
      status: "success",
      message: "Dependency added.",
      idempotencyKeyDisposition: "rotate",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function removeDependencyAction(
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  try {
    const projectRecords = await operations();
    await projectRecords.removeDependency({
      projectId: stringValue(formData, "projectId"),
      dependencyId: stringValue(formData, "dependencyId"),
      expectedWorkflowGeneration: Number(
        stringValue(formData, "expectedWorkflowGeneration"),
      ),
      idempotencyKey: stringValue(formData, "idempotencyKey"),
    });
    revalidatePath("/app", "layout");
    return {
      status: "success",
      message: "Dependency removed.",
      idempotencyKeyDisposition: "rotate",
    };
  } catch (error) {
    return actionError(error);
  }
}
