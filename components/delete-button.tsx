"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { dangerButton, secondaryButton } from "@/lib/ui";

type Result = { ok?: boolean; error?: string } | undefined;

type Props = {
  action: (prev: Result, formData: FormData) => Promise<Result>;
  id: number;
  itemName: string;
  consequence: string;
};

export default function DeleteButton({ action, id, itemName, consequence }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) dialogRef.current?.close();
  }, [state]);

  function open() {
    dialogRef.current?.showModal();
    cancelRef.current?.focus();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex min-h-11 items-center px-3 text-sm text-danger underline underline-offset-4 hover:brightness-110"
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-0 text-ink shadow-[var(--elev-card)] backdrop:bg-black/70"
      >
        <form action={formAction} className="p-6">
          <input type="hidden" name="id" value={id} />
          <h2 id={titleId} className="break-words font-display text-xl font-bold">
            Delete “{itemName}”?
          </h2>
          <p id={descId} className="mt-2 text-muted">
            {consequence}
          </p>

          {state?.error && (
            <p role="alert" className="mt-3 text-danger">
              {state.error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              ref={cancelRef}
              type="button"
              onClick={() => dialogRef.current?.close()}
              className={secondaryButton}
            >
              Cancel
            </button>
            <button disabled={pending} className={dangerButton}>
              {pending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}