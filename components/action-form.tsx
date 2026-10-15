"use client";

import type { ActionState } from "@/lib/action-state";
import { useActionState, type ReactNode } from "react";

type Props = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  className?: string;
  children: ReactNode;
};

export function ActionForm({ action, className, children }: Props) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className={className}>
      {children}
      {state.message ? (
        <p
          role="status"
          className={`mt-3 text-sm ${state.ok ? "text-emerald-700" : "text-accent"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
