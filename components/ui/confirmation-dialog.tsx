"use client";

import { useRef, useState } from "react";
import { InlineResult } from "./primitives";
import { PREVIEW_RESET_EVENT } from "@/lib/ui-events";

export function ConfirmationDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [result, setResult] = useState(false);

  function openDialog() {
    setResult(false);
    dialogRef.current?.showModal();
    requestAnimationFrame(() => cancelRef.current?.focus());
  }

  function closeDialog() {
    dialogRef.current?.close();
    triggerRef.current?.focus();
  }

  function confirmReset() {
    dialogRef.current?.close();
    window.dispatchEvent(new Event(PREVIEW_RESET_EVENT));
    setResult(true);
    triggerRef.current?.focus();
  }

  return (
    <div className="confirmation-pattern">
      <button className="button button--secondary button--compact" onClick={openDialog} ref={triggerRef} type="button">
        Reset preview
      </button>
      <dialog
        aria-describedby="reset-dialog-description"
        aria-labelledby="reset-dialog-title"
        className="dialog"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClose={() => triggerRef.current?.focus()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeDialog();
          }
        }}
        ref={dialogRef}
      >
        <div className="dialog__content">
          <p className="eyebrow">Demo control</p>
          <h2 id="reset-dialog-title">Reset the UI preview?</h2>
          <p id="reset-dialog-description">
            This resets local interface state only. No project record, approval, history entry, or backend data will change.
          </p>
          <div className="dialog__actions">
            <button className="button button--secondary" onClick={closeDialog} ref={cancelRef} type="button">Cancel</button>
            <button className="button button--primary" onClick={confirmReset} type="button">Reset UI preview</button>
          </div>
        </div>
      </dialog>
      {result ? <InlineResult tone="success">UI preview returned to its default navigation and tab state. No project data was changed.</InlineResult> : null}
    </div>
  );
}
