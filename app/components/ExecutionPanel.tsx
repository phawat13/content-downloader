"use client";

import { useEffect, useRef, useState } from "react";
import type { PipelineResult, LogEntry } from "@/app/lib/types";

interface ExecutionPanelProps {
  isExecuting: boolean;
  logs: LogEntry[];
  results: PipelineResult[] | null;
  progress: { stepIndex: number; current: number; total: number } | null;
  onExecute: () => void;
  onSaveToServer: (path: string) => void;
  onDownloadZip: () => void;
}

export default function ExecutionPanel({
  isExecuting,
  logs,
  results,
  progress,
  onExecute,
  onSaveToServer,
  onDownloadZip,
}: ExecutionPanelProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [savePath, setSavePath] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSave = () => {
    if (!savePath.trim()) return;
    setSaveStatus("Saving...");
    onSaveToServer(savePath);
    setSaveStatus(null);
  };

  const levelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-500";
      case "warn":
        return "text-yellow-500";
      case "success":
        return "text-green-500";
      default:
        return "text-zinc-500 dark:text-zinc-400";
    }
  };

  const levelIcon = (level: string) => {
    switch (level) {
      case "error":
        return "x";
      case "warn":
        return "!";
      case "success":
        return "v";
      default:
        return ">";
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Execution
        </h2>
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2"
        >
          {isExecuting ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Running...
            </>
          ) : (
            "Execute Pipeline"
          )}
        </button>
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
            <span>Step {(progress.stepIndex ?? 0) + 1} progress</span>
            <span>
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300 rounded-full"
              style={{
                width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-[200px] max-h-[400px]">
        {logs.length === 0 && !isExecuting && !results ? (
          <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm">
            Configure your pipeline and click Execute
          </div>
        ) : (
          <div className="space-y-0.5 font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className={`${levelColor(log.level)} flex gap-2`}>
                <span className="opacity-50 select-none w-4 text-center shrink-0">
                  {levelIcon(log.level)}
                </span>
                <span className="break-all">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Results */}
      {results && results.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Results: {results.length} files
            </span>
            <span className="text-xs text-zinc-500">
              Total:{" "}
              {(
                results.reduce((sum, r) => sum + r.content.length, 0) /
                1024
              ).toFixed(1)}{" "}
              KB
            </span>
          </div>

          {/* File list */}
          <div className="max-h-32 overflow-y-auto space-y-0.5">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate flex-1 mr-2">
                  {r.filename}
                </span>
                <span className="text-zinc-400 shrink-0">
                  {(r.content.length / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={savePath}
                onChange={(e) => setSavePath(e.target.value)}
                placeholder="D:/downloads/output"
                className="flex-1 px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <button
                onClick={handleSave}
                disabled={!savePath.trim()}
                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded-md transition-colors shrink-0"
              >
                Save to Server
              </button>
            </div>
            {saveStatus && (
              <p className="text-xs text-green-600">{saveStatus}</p>
            )}
            <button
              onClick={onDownloadZip}
              className="w-full py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
            >
              Download as Zip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
