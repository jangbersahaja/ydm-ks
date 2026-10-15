import { isTaskKind, type TaskKind } from "@/lib/constants";
import type { Dict } from "@/lib/i18n/dictionaries";

export function ledgerLabel(reason: string, t: Dict): string {
  if (reason === "purchase") return t.history.purchase;
  if (reason === "redeem" || reason.startsWith("redeem:"))
    return t.history.redeem;
  if (reason === "bonus:first_purchase") return t.history.firstPurchaseBonus;
  if (reason.startsWith("task:")) {
    const kind = reason.slice("task:".length).split(":")[0];
    if (isTaskKind(kind)) return t.tasks.titles[kind];
  }
  return t.history.adjust;
}

export function taskTitle(kind: string, t: Dict): string {
  return isTaskKind(kind) ? t.tasks.titles[kind as TaskKind] : kind;
}
