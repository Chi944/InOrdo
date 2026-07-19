import type { AuthorizedProjectScope } from "@/lib/auth/guards";
import type { ServerSupabaseClient } from "@/lib/supabase/server";
import type { WorkspaceRole } from "@/lib/auth/membership";
import type { Tables } from "@/types/database";
import type {
  CreateDependencyInput,
  CreateProjectItemInput,
  DeleteDependencyInput,
  ListProjectItemsFilters,
  UpdateProjectItemInput,
} from "@/features/project-records/schemas";

export type ProjectRecordMutationStatus = "succeeded" | "duplicate";

export type ProjectRecordMutationResult<Record> = {
  status: ProjectRecordMutationStatus;
  workflowGeneration: number;
  record: Record;
};

export type RemoveDependencyMutationResult = {
  status: ProjectRecordMutationStatus;
  workflowGeneration: number;
  dependencyId: string;
};

export type ProjectItemPage = {
  items: Tables<"project_items">[];
  total: number;
  nextCursor: string | null;
};

export type ProjectRecordAuthorization = {
  scope: AuthorizedProjectScope;
};

export type ProjectRecordAuthorizer = (
  client: ServerSupabaseClient,
  projectId: string,
  allowedRoles: readonly WorkspaceRole[],
) => Promise<ProjectRecordAuthorization>;

export interface ProjectRecordStore {
  createItem(
    scope: AuthorizedProjectScope,
    input: CreateProjectItemInput,
  ): Promise<ProjectRecordMutationResult<Tables<"project_items">>>;
  updateItem(
    scope: AuthorizedProjectScope,
    input: UpdateProjectItemInput,
  ): Promise<ProjectRecordMutationResult<Tables<"project_items">>>;
  listItems(
    scope: AuthorizedProjectScope,
    filters: ListProjectItemsFilters,
  ): Promise<ProjectItemPage>;
  createDependency(
    scope: AuthorizedProjectScope,
    input: CreateDependencyInput,
  ): Promise<ProjectRecordMutationResult<Tables<"item_dependencies">>>;
  removeDependency(
    scope: AuthorizedProjectScope,
    input: DeleteDependencyInput,
  ): Promise<RemoveDependencyMutationResult>;
  listDependencies(
    scope: AuthorizedProjectScope,
  ): Promise<Tables<"item_dependencies">[]>;
}
