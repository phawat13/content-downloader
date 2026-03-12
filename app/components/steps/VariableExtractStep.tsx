"use client";

import type { VariableExtractStep as VariableExtractStepType } from "@/app/lib/types";

interface Props {
  config: VariableExtractStepType["config"];
  onUpdate: (config: Partial<VariableExtractStepType["config"]>) => void;
}

export default function VariableExtractStep({
  config,
  onUpdate,
}: Props) {
  const updateExtraction = (
    index: number,
    field: string,
    value: string
  ) => {
    const newExtractions = [...config.extractions];
    newExtractions[index] = { ...newExtractions[index], [field]: value };
    onUpdate({ extractions: newExtractions });
  };

  const addExtraction = () => {
    onUpdate({
      extractions: [
        ...config.extractions,
        { variableName: "", selector: "", attribute: "", regex: "" },
      ],
    });
  };

  const removeExtraction = (index: number) => {
    onUpdate({
      extractions: config.extractions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-3">
      {config.extractions.map((ext, i) => (
        <div
          key={i}
          className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-md space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
              Variable #{i + 1}
            </span>
            <button
              onClick={() => removeExtraction(i)}
              className="text-xs text-zinc-400 hover:text-red-500"
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                Variable Name
              </label>
              <input
                type="text"
                value={ext.variableName}
                onChange={(e) =>
                  updateExtraction(i, "variableName", e.target.value)
                }
                placeholder="chapter, title, author"
                className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                CSS Selector
              </label>
              <input
                type="text"
                value={ext.selector}
                onChange={(e) =>
                  updateExtraction(i, "selector", e.target.value)
                }
                placeholder="h1.chapter-title"
                className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                Attribute (optional)
              </label>
              <input
                type="text"
                value={ext.attribute}
                onChange={(e) =>
                  updateExtraction(i, "attribute", e.target.value)
                }
                placeholder="Empty = text content"
                className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                Regex (optional, capture group 1)
              </label>
              <input
                type="text"
                value={ext.regex}
                onChange={(e) =>
                  updateExtraction(i, "regex", e.target.value)
                }
                placeholder="Chapter (\d+)"
                className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addExtraction}
        className="w-full py-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 border border-dashed border-teal-300 dark:border-teal-700 rounded-md hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
      >
        + Add Variable Extraction
      </button>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Variables can be used in Save filename pattern as{" "}
        <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
          [variableName]
        </code>
      </p>
    </div>
  );
}
