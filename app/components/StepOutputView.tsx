"use client";

import { useState } from "react";
import type { StepOutput } from "@/app/lib/types";

interface StepOutputViewProps {
  output: StepOutput;
}

export default function StepOutputView({ output }: StepOutputViewProps) {
  const [expanded, setExpanded] = useState(true);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  return (
    <div className="mt-3 border-t border-zinc-200 dark:border-zinc-700 pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 mb-2"
      >
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5l8 7-8 7z" />
        </svg>
        Output: {output.itemCount} items
        {output.itemCount > output.items.length && (
          <span className="text-zinc-400">
            (showing {output.items.length})
          </span>
        )}
      </button>

      {expanded && (
        <div className="space-y-1">
          {/* Compact table view */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800">
                  <tr>
                    <th className="text-left px-2 py-1 font-medium text-zinc-500 dark:text-zinc-400 w-8">
                      #
                    </th>
                    {output.stepType === "save" ? (
                      <>
                        <th className="text-left px-2 py-1 font-medium text-zinc-500 dark:text-zinc-400">
                          Filename
                        </th>
                        <th className="text-right px-2 py-1 font-medium text-zinc-500 dark:text-zinc-400 w-16">
                          Size
                        </th>
                      </>
                    ) : output.stepType === "url-source" ||
                      output.stepType === "extract-urls" ? (
                      <th className="text-left px-2 py-1 font-medium text-zinc-500 dark:text-zinc-400">
                        URL
                      </th>
                    ) : output.stepType === "variable-extract" ? (
                      <>
                        <th className="text-left px-2 py-1 font-medium text-zinc-500 dark:text-zinc-400">
                          URL
                        </th>
                        <th className="text-left px-2 py-1 font-medium text-zinc-500 dark:text-zinc-400">
                          Variables
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="text-left px-2 py-1 font-medium text-zinc-500 dark:text-zinc-400">
                          URL
                        </th>
                        <th className="text-left px-2 py-1 font-medium text-zinc-500 dark:text-zinc-400 w-12">
                          Status
                        </th>
                        <th className="text-right px-2 py-1 font-medium text-zinc-500 dark:text-zinc-400 w-16">
                          Size
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {output.items.map((item, i) => (
                    <tr
                      key={i}
                      onClick={() =>
                        setSelectedItem(selectedItem === i ? null : i)
                      }
                      className={`cursor-pointer border-t border-zinc-100 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 ${
                        selectedItem === i
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <td className="px-2 py-1 text-zinc-400">{i + 1}</td>
                      {output.stepType === "save" ? (
                        <>
                          <td className="px-2 py-1 font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-[300px]">
                            {item.contentPreview}
                          </td>
                          <td className="px-2 py-1 text-right text-zinc-500">
                            {formatSize(item.size)}
                          </td>
                        </>
                      ) : output.stepType === "url-source" ||
                        output.stepType === "extract-urls" ? (
                        <td className="px-2 py-1 font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-[400px]">
                          {item.url}
                        </td>
                      ) : output.stepType === "variable-extract" ? (
                        <>
                          <td className="px-2 py-1 font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                            {item.url}
                          </td>
                          <td className="px-2 py-1 text-zinc-600 dark:text-zinc-400">
                            {Object.entries(item.variables)
                              .filter(([k]) => !k.startsWith("_"))
                              .map(([k, v]) => `${k}="${v}"`)
                              .join(", ") || "-"}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-1 font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-[250px]">
                            {item.url}
                          </td>
                          <td className="px-2 py-1 text-center">
                            {item.status === "ok" ? (
                              <span className="text-green-500">ok</span>
                            ) : item.status === "error" ? (
                              <span className="text-red-500">err</span>
                            ) : (
                              <span className="text-zinc-400">-</span>
                            )}
                          </td>
                          <td className="px-2 py-1 text-right text-zinc-500">
                            {item.size > 0 ? formatSize(item.size) : "-"}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Content preview for selected item */}
          {selectedItem !== null && output.items[selectedItem] && (
            <div className="bg-zinc-900 dark:bg-black rounded-md p-3 max-h-40 overflow-y-auto">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-zinc-400">
                  Content Preview - Item #{selectedItem + 1}
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Close
                </button>
              </div>
              {Object.keys(
                output.items[selectedItem].variables
              ).filter((k) => !k.startsWith("_")).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {Object.entries(output.items[selectedItem].variables)
                    .filter(([k]) => !k.startsWith("_"))
                    .map(([k, v]) => (
                      <span
                        key={k}
                        className="px-1.5 py-0.5 text-xs bg-zinc-800 dark:bg-zinc-700 text-teal-400 rounded font-mono"
                      >
                        {k}=&quot;{v}&quot;
                      </span>
                    ))}
                </div>
              )}
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-all font-mono leading-relaxed">
                {output.items[selectedItem].contentPreview || "(empty)"}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
