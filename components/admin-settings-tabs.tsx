"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type Tab = {
  label: string;
  content: ReactNode;
};

type Props = {
  tabs: Tab[];
  label: string;
};

export function AdminSettingsTabs({ tabs, label }: Props) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectTab(index: number) {
    setSelected(index);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight")
      nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      selectTab(nextIndex);
    }
  }

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label={label}
        className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`settings-tab-${index}`}
            aria-selected={selected === index}
            aria-controls={`settings-panel-${index}`}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roast ${
              selected === index
                ? "bg-roast text-cream"
                : "bg-white text-espresso ring-1 ring-espresso/15 hover:bg-espresso/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`settings-panel-${index}`}
          aria-labelledby={`settings-tab-${index}`}
          tabIndex={0}
          hidden={selected !== index}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
