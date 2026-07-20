export type RecordActionState = {
  status: "idle" | "success" | "error" | "conflict";
  message: string;
  idempotencyKeyDisposition: "retain" | "rotate";
};

export const initialRecordActionState: RecordActionState = {
  status: "idle",
  message: "",
  idempotencyKeyDisposition: "retain",
};

export function restoreRecordMutationForm(
  form: HTMLFormElement,
  formData: FormData,
  restoreIdempotencyKey: boolean,
) {
  for (const [name, value] of formData.entries()) {
    if (name === "idempotencyKey" && !restoreIdempotencyKey) continue;
    if (typeof value !== "string") continue;

    const control = form.elements.namedItem(name);
    if (
      control instanceof HTMLInputElement ||
      control instanceof HTMLSelectElement ||
      control instanceof HTMLTextAreaElement
    ) {
      control.value = value;
    }
  }
}
