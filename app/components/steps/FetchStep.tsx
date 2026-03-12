"use client";

import { useState } from "react";
import type { FetchStep as FetchStepType } from "@/app/lib/types";

interface Props {
  config: FetchStepType["config"];
  onUpdate: (config: Partial<FetchStepType["config"]>) => void;
}

export default function FetchStep({ config, onUpdate }: Props) {
  const [showHeaders, setShowHeaders] = useState(
    Object.keys(config.headers).length > 0
  );

  const headerEntries = Object.entries(config.headers);

  const updateHeader = (
    oldKey: string,
    newKey: string,
    value: string
  ) => {
    const newHeaders = { ...config.headers };
    if (oldKey !== newKey) delete newHeaders[oldKey];
    newHeaders[newKey] = value;
    onUpdate({ headers: newHeaders });
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...config.headers };
    delete newHeaders[key];
    onUpdate({ headers: newHeaders });
  };

  const addHeader = () => {
    onUpdate({ headers: { ...config.headers, "": "" } });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Concurrency
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={config.concurrency}
            onChange={(e) =>
              onUpdate({ concurrency: parseInt(e.target.value) || 1 })
            }
            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Delay (ms)
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={config.delayMs}
            onChange={(e) =>
              onUpdate({ delayMs: parseInt(e.target.value) || 0 })
            }
            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Timeout (ms)
          </label>
          <input
            type="number"
            min={1000}
            step={1000}
            value={config.timeoutMs}
            onChange={(e) =>
              onUpdate({ timeoutMs: parseInt(e.target.value) || 10000 })
            }
            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowHeaders(!showHeaders)}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium"
        >
          {showHeaders ? "- Hide" : "+ Show"} Custom Headers
        </button>
        {showHeaders && (
          <div className="mt-2 space-y-2">
            {headerEntries.map(([key, value], i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) =>
                    updateHeader(key, e.target.value, value)
                  }
                  placeholder="Header name"
                  className="flex-1 px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    updateHeader(key, key, e.target.value)
                  }
                  placeholder="Value"
                  className="flex-1 px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button
                  onClick={() => removeHeader(key)}
                  className="text-zinc-400 hover:text-red-500 text-xs px-1"
                >
                  x
                </button>
              </div>
            ))}
            <button
              onClick={addHeader}
              className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 font-medium"
            >
              + Add Header
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
