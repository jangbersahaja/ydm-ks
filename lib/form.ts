import type { ActionState } from "./action-state";

export function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function fail(message: string): ActionState {
  return { ok: false, message };
}

export function succeed(message: string): ActionState {
  return { ok: true, message };
}
