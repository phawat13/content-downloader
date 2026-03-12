"use client";

import type { ExtractContentStep as ExtractContentStepType } from "@/app/lib/types";

interface Props {
  config: ExtractContentStepType["config"];
  onUpdate: (config: Partial<ExtractContentStepType["config"]>) => void;
}

export default function ExtractContentStep({
  config,
  onUpdate,
}: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          CSS Selector
        </label>
        <input
          type="text"
          value={config.selector}
          onChange={(e) => onUpdate({ selector: e.target.value })}
          placeholder="#content, .article-body, article, div.chapter"
          className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
        />
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Output Format
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate({ outputFormat: "text" })}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                config.outputFormat === "text"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              Text
            </button>
            <button
              onClick={() => onUpdate({ outputFormat: "html" })}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                config.outputFormat === "html"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              HTML
            </button>
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Attribute (optional)
          </label>
          <input
            type="text"
            value={config.attribute}
            onChange={(e) => onUpdate({ attribute: e.target.value })}
            placeholder="Leave empty for inner content"
            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Examples: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">#content</code>{" "}
        <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">.article-body</code>{" "}
        <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">div.chapter-text p</code>
      </p>
    </div>
  );
}
