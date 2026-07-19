import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const actionMocks = vi.hoisted(() => ({
  updateProjectItemAction: vi.fn(),
}));

vi.mock("@/app/app/project-record-actions", () => actionMocks);
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { ProjectItemEditor } from "@/app/app/items/project-item-editor";

afterEach(cleanup);

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  actionMocks.updateProjectItemAction.mockReset().mockResolvedValue({
    status: "conflict",
    message: "Conflict: The project changed. Refresh and try again.",
    idempotencyKeyDisposition: "rotate",
  });
});

describe("ProjectItemEditor", () => {
  it("submits generation-fenced edits and rotates the key after a stale conflict", async () => {
    const user = userEvent.setup();
    render(
      <ProjectItemEditor
        canEdit
        item={{
          id: "3e14b4a4-421d-4d6d-8a7e-01d5a22e3002",
          itemKey: "TASK-24",
          itemType: "task",
          title: "Confirm keynote speakers",
          description: "Reconfirm availability.",
          status: "blocked",
          priority: "high",
          ownerId: null,
          startDate: "2026-07-01",
          dueDate: "2026-07-18",
          eventDate: null,
          version: 7,
        }}
        memberOptions={[]}
        projectId="8d2baf13-b687-4987-83a0-0b1294b0f001"
        workflowGeneration={4}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit item" }));
    const dialog = screen.getByRole("dialog", { name: "Edit TASK-24" });
    const form = dialog.querySelector("form");
    expect(
      form?.querySelector<HTMLInputElement>(
        'input[name="expectedWorkflowGeneration"]',
      ),
    ).toHaveValue("4");
    const keyInput = form?.querySelector<HTMLInputElement>(
      'input[name="idempotencyKey"]',
    );
    await waitFor(() =>
      expect(keyInput?.value).toMatch(/^[A-Za-z0-9._:-]{8,200}$/),
    );
    const initialKey = keyInput?.value;
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Confirm all speakers");
    expect(keyInput?.value).not.toBe(initialKey);
    const submittedKey = keyInput?.value;

    await user.click(screen.getByRole("button", { name: "Save item" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Refresh required\.\s*Conflict: The project changed\. Refresh and try again\./,
    );
    await waitFor(() => expect(keyInput?.value).not.toBe(submittedKey));
    expect(dialog).toHaveAttribute("open");

    const submittedForm = actionMocks.updateProjectItemAction.mock.calls[0]?.[1];
    expect(submittedForm).toBeInstanceOf(FormData);
    expect((submittedForm as FormData).get("expectedWorkflowGeneration")).toBe(
      "4",
    );
    expect((submittedForm as FormData).get("idempotencyKey")).toBe(submittedKey);
  });
});
