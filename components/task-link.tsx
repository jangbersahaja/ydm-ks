"use client";

import { claimTaskAction } from "@/app/actions/customer";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import type { ActionState } from "@/lib/action-state";
import { useState, useTransition } from "react";

type Props = {
  taskId: number;
  url: string;
  done: boolean;
  openLabel: string;
  doneLabel: string;
};

export function TaskLink({ taskId, url, done, openLabel, doneLabel }: Props) {
  const [result, setResult] = useState<ActionState | null>(null);
  const [, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      setResult(await claimTaskAction(taskId));
    });
  }

  const label = done ? doneLabel : openLabel;

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label={label}
        title={label}
        className={`flex h-11 w-11 items-center justify-center rounded-full text-white transition active:scale-95 ${
          done ? "bg-success" : "bg-roast"
        }`}
      >
        {done ? <CheckIcon /> : <ArrowIcon />}
      </a>
      {result?.message ? (
        <p
          role="status"
          className={`max-w-[12rem] text-right text-xs ${result.ok ? "text-success" : "text-accent"}`}
        >
          {result.message}
        </p>
      ) : null}
    </div>
  );
}
