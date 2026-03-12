"use client";

import type { SaveStep as SaveStepType } from "@/app/lib/types";

interface Props {
  config: SaveStepType["config"];
  onUpdate: (config: Partial<SaveStepType["config"]>) => void;
}

export default function SaveStep({ config, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Filename Pattern
        </label>
        <input
          type="text"
          value={config.filenamePattern}
          onChange={(e) =>
            onUpdate({ filenamePattern: e.target.value })
          }
          placeholder="text[*].txt or chapter[chapter]-[chaptername].txt"
          className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Variables:{" "}
          <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">[*]</code>{" "}
          <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">[index]</code>{" "}
          = sequence number,{" "}
          <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">[filename]</code>{" "}
          = URL filename,{" "}
          <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">[url]</code>{" "}
          = full URL, plus any custom variables from Variable Extract step
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Save Mode
        </label>
        <div className="flex gap-2">
          {(
            [
              { value: "server", label: "Server" },
              { value: "download", label: "Download Zip" },
              { value: "both", label: "Both" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ mode: opt.value })}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                config.mode === opt.value
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {(config.mode === "server" || config.mode === "both") && (
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Server Folder Path
          </label>
          <input
            type="text"
            value={config.serverPath}
            onChange={(e) => onUpdate({ serverPath: e.target.value })}
            placeholder="D:/downloads/my-content"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Absolute path on the server where files will be saved
          </p>
        </div>
      )}
    </div>
  );
}
