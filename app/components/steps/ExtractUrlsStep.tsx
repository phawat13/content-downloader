"use client";

import type { ExtractUrlsStep as ExtractUrlsStepType } from "@/app/lib/types";

interface Props {
  config: ExtractUrlsStepType["config"];
  onUpdate: (config: Partial<ExtractUrlsStepType["config"]>) => void;
}

export default function ExtractUrlsStep({ config, onUpdate }: Props) {
  const inputField = config.inputField || "html";

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Input Source
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ inputField: "html" })}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              inputField === "html"
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            From HTML (original page)
          </button>
          <button
            onClick={() => onUpdate({ inputField: "content" })}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              inputField === "content"
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            From Content (extracted)
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {inputField === "content"
            ? "Parse URLs from the extracted content of the previous step"
            : "Parse URLs from the original fetched HTML"}
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          CSS Selector for Links
        </label>
        <input
          type="text"
          value={config.selector}
          onChange={(e) => onUpdate({ selector: e.target.value })}
          placeholder="a.chapter-link, ul.nav a, .pagination a"
          className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Attribute
          </label>
          <input
            type="text"
            value={config.attribute}
            onChange={(e) => onUpdate({ attribute: e.target.value })}
            placeholder="href"
            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Base URL (for relative links)
          </label>
          <input
            type="text"
            value={config.baseUrl}
            onChange={(e) => onUpdate({ baseUrl: e.target.value })}
            placeholder="Auto-detected from source URL"
            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Extracted URLs will replace the current URL list. Use this to
        chain: Extract URLs → Fetch → Extract Content
      </p>
    </div>
  );
}
