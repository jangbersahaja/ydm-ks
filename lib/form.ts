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

// Turns thrown errors into a generic failure. Do not call redirect() inside `action`.
export async function runAction(
  unexpected: string,
  action: () => Promise<ActionState>,
): Promise<ActionState> {
  try {
    return await action();
  } catch (error) {
    console.error("Action failed", error);
    return fail(unexpected);
  }
}

// Random 32-char hex id. randomUUID is unavailable on plain-http LAN origins.
export function newRequestId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
