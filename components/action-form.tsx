"use client";

import type { ActionState } from "@/lib/action-state";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, type ReactNode } from "react";

type Props = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  className?: string;
  children: ReactNode;
  // Runs after each successful submit, e.g. to reset fields. Pass a stable callback.
  onSuccess?: () => void;
  // Where to send the user when the session has ended.
  loginPath?: string;
};

export function ActionForm({
  action,
  className,
  children,
  onSuccess,
  loginPath,
}: Props) {
  const [state, formAction] = useActionState(action, {});
  const router = useRouter();
  useEffect(() => {
    if (state.ok) onSuccess?.();
    if (state.code === "session" && loginPath) router.replace(loginPath);
  }, [state, onSuccess, loginPath, router]);
  return (
    <form action={formAction} className={className}>
      {children}
      {state.message ? (
        <p
          role="status"
          className={`mt-3 text-sm ${state.ok ? "text-success" : "text-accent"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
