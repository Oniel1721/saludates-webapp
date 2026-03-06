"use client";

import { useState } from "react";

type DevState<T> = {
  label: string;
  value: T;
};

type DevPanelProps<T> = {
  states: DevState<T>[];
  current: T;
  onSelect: (value: T) => void;
};

export function DevPanel<T>({ states, current, onSelect }: DevPanelProps<T>) {
  const [open, setOpen] = useState(true);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-1">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-100 shadow-lg"
      >
        <span>🛠</span>
        <span>Dev</span>
        <span className="text-zinc-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-1 rounded-md border border-zinc-200 bg-white p-2 shadow-lg">
          {states.map((s) => {
            const isActive = s.value === current;
            return (
              <button
                key={String(s.value)}
                onClick={() => onSelect(s.value)}
                className={`rounded px-2.5 py-1 text-left text-xs transition-colors ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
