"use client";

import { useState, useRef, useEffect } from "react";
import type { StepType } from "@/app/lib/types";
import { STEP_META } from "@/app/lib/types";

interface AddStepButtonProps {
  onAdd: (type: StepType) => void;
}

const STEP_TYPES: StepType[] = [
  "url-source",
  "fetch",
  "extract-content",
  "extract-urls",
  "variable-extract",
  "translate",
  "save",
];

export default function AddStepButton({ onAdd }: AddStepButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative mt-3" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-2 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-sm font-medium"
      >
        + Add Step
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden">
          {STEP_TYPES.map((type) => {
            const meta = STEP_META[type];
            return (
              <button
                key={type}
                onClick={() => {
                  onAdd(type);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-3"
              >
                <span className={`w-2 h-2 rounded-full ${meta.bgColor}`} />
                <div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {meta.label}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {meta.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
