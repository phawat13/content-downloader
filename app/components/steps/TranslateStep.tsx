"use client";

import { useState, useEffect } from "react";
import type { TranslateStep as TranslateStepType } from "@/app/lib/types";

// Map legacy/preview model names to current stable names
const MODEL_ALIASES: Record<string, string> = {
  "gemini-2.5-flash-preview-05-20": "gemini-2.5-flash",
  "gemini-2.5-pro-preview-05-06": "gemini-2.5-pro",
  "gemini-2.5-flash-preview": "gemini-2.5-flash",
  "gemini-2.5-pro-preview": "gemini-2.5-pro",
};

const VALID_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
];

interface Props {
  config: TranslateStepType["config"];
  onUpdate: (config: Partial<TranslateStepType["config"]>) => void;
}

export default function TranslateStep({ config, onUpdate }: Props) {
  const [showPrompt, setShowPrompt] = useState(false);

  // Auto-fix legacy model names from saved configs
  useEffect(() => {
    if (config.model && !VALID_MODELS.includes(config.model)) {
      const fixed = MODEL_ALIASES[config.model] || "gemini-2.5-flash";
      onUpdate({ model: fixed });
    }
  }, [config.model, onUpdate]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Gemini API Key
        </label>
        <input
          type="password"
          value={config.apiKey}
          onChange={(e) => onUpdate({ apiKey: e.target.value })}
          placeholder="AIza..."
          className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Model
          </label>
          <select
            value={config.model}
            onChange={(e) => onUpdate({ model: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Target Language
          </label>
          <input
            type="text"
            value={config.targetLanguage}
            onChange={(e) => onUpdate({ targetLanguage: e.target.value })}
            placeholder="Thai"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Source Language
          </label>
          <input
            type="text"
            value={config.sourceLanguage}
            onChange={(e) => onUpdate({ sourceLanguage: e.target.value })}
            placeholder="auto-detect"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Concurrency
          </label>
          <input
            type="number"
            value={config.concurrency}
            onChange={(e) =>
              onUpdate({ concurrency: Math.max(1, parseInt(e.target.value) || 1) })
            }
            min={1}
            max={10}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Delay (ms)
          </label>
          <input
            type="number"
            value={config.delayMs}
            onChange={(e) =>
              onUpdate({ delayMs: Math.max(0, parseInt(e.target.value) || 0) })
            }
            min={0}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
        >
          {showPrompt ? "- Hide Custom Prompt" : "+ Custom Prompt"}
        </button>
        {showPrompt && (
          <textarea
            value={config.prompt}
            onChange={(e) => onUpdate({ prompt: e.target.value })}
            placeholder="Leave empty for default translation prompt. The content will be appended after this prompt."
            rows={3}
            className="mt-1 w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-y"
          />
        )}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Translates extracted content using Gemini AI. Full detailed translation, no summarization.
      </p>
    </div>
  );
}
