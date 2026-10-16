import { CloseIcon } from "@/components/icons";
import { iconButtonClass } from "@/components/ui";
import type { ReactNode } from "react";

export function SheetHeader({
  children,
  closeLabel,
  onClose,
}: {
  children: ReactNode;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="flex w-full items-start justify-between gap-3">
      <div className="min-w-0 text-left">{children}</div>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        title={closeLabel}
        className={iconButtonClass("secondary")}
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
