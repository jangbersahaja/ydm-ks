"use client";

import { type ReactNode, useEffect, useRef } from "react";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

const sheetClass =
  "fixed inset-x-0 top-auto bottom-0 mx-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-0 text-espresso shadow-xl backdrop:bg-espresso/60 open:animate-[sheet-up_220ms_ease-out]";

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      className={sheetClass}
    >
      <div
        className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-espresso/20"
        aria-hidden="true"
      />
      {open ? children : null}
    </dialog>
  );
}
