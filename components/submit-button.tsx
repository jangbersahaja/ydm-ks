"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function SubmitButton({ children, className, disabled }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={className}>
      {children}
    </button>
  );
}
