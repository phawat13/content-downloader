"use client";

import type { PipelineStep, StepOutput } from "@/app/lib/types";
import { STEP_META } from "@/app/lib/types";
import StepOutputView from "./StepOutputView";

interface StepCardProps {
  step: PipelineStep;
  index: number;
  totalSteps: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRunToHere: () => void;
  isRunning: boolean;
  stepOutput: StepOutput | null;
  children: React.ReactNode;
}

export default function StepCard({
  step,
  index,
  totalSteps,
  onRemove,
  onMoveUp,
  onMoveDown,
  onRunToHere,
  isRunning,
  stepOutput,
  children,
}: StepCardProps) {
  const meta = STEP_META[step.type];

  return (
    <div
      className={`border-l-4 ${meta.color} bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700`}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span
            className={`${meta.bgColor} text-white text-xs font-bold px-2 py-0.5 rounded`}
          >
            {index + 1}
          </span>
          <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
            {meta.label}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
            {meta.description}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Run to here button */}
          <button
            onClick={onRunToHere}
            disabled={isRunning}
            className="px-2 py-0.5 text-xs font-medium rounded transition-colors bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/40 dark:hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            title="Execute pipeline up to this step"
          >
            {isRunning ? (
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            Run
          </button>
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === totalSteps - 1}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-zinc-400 hover:text-red-500"
            title="Remove step"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-4">
        {children}
        {stepOutput && <StepOutputView output={stepOutput} />}
      </div>
    </div>
  );
}

export function StepConnector() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-4 bg-zinc-300 dark:bg-zinc-600" />
        <svg
          className="w-3 h-3 text-zinc-400 dark:text-zinc-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 16l-6-6h12z" />
        </svg>
      </div>
    </div>
  );
}
