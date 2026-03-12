"use client";

import { useRef } from "react";
import type { UrlSourceStep as UrlSourceStepType } from "@/app/lib/types";
import { expandUrlPattern } from "@/app/lib/url-pattern";

interface Props {
  config: UrlSourceStepType["config"];
  onUpdate: (config: Partial<UrlSourceStepType["config"]>) => void;
}

const modeBtn = (active: boolean) =>
  `px-3 py-1 text-xs rounded-full font-medium transition-colors ${
    active
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
  }`;

export default function UrlSourceStep({ config, onUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const previewUrls =
    config.mode === "pattern" && config.pattern
      ? expandUrlPattern(config.pattern)
      : [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({ urlList: reader.result as string, mode: "list" });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => onUpdate({ mode: "pattern" })}
          className={modeBtn(config.mode === "pattern")}
        >
          URL Pattern
        </button>
        <button
          onClick={() => onUpdate({ mode: "list" })}
          className={modeBtn(config.mode === "list")}
        >
          URL List
        </button>
        <button
          onClick={() => onUpdate({ mode: "from-previous" })}
          className={modeBtn(config.mode === "from-previous")}
        >
          From Previous Step
        </button>
      </div>

      {config.mode === "pattern" ? (
        <div className="space-y-2">
          <input
            type="text"
            value={config.pattern}
            onChange={(e) => onUpdate({ pattern: e.target.value })}
            placeholder="http://example.com/chapter-[1-20].html"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Use [N-M] for ranges. Zero-padded: [01-20]. Example:
            page[1-100].html
          </p>
          {previewUrls.length > 0 && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 p-2 rounded-md max-h-24 overflow-y-auto font-mono">
              <div className="font-medium mb-1">
                Preview ({previewUrls.length} URLs):
              </div>
              {previewUrls.slice(0, 3).map((url, i) => (
                <div key={i} className="truncate">
                  {url}
                </div>
              ))}
              {previewUrls.length > 3 && (
                <>
                  <div>...</div>
                  <div className="truncate">
                    {previewUrls[previewUrls.length - 1]}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : config.mode === "list" ? (
        <div className="space-y-2">
          <textarea
            value={config.urlList}
            onChange={(e) => onUpdate({ urlList: e.target.value })}
            placeholder="Paste URLs here, one per line..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono resize-y"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
            >
              Upload .txt file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.text"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="text-xs text-zinc-500">
              {config.urlList
                ? `${config.urlList.split("\n").filter(Boolean).length} URLs`
                : "No URLs"}
            </span>
          </div>
        </div>
      ) : (
        /* from-previous mode */
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Read URLs from
            </label>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  onUpdate({ fromPreviousField: "url" })
                }
                className={modeBtn(
                  (config.fromPreviousField || "url") === "url"
                )}
              >
                URL field
              </button>
              <button
                onClick={() =>
                  onUpdate({ fromPreviousField: "content" })
                }
                className={modeBtn(
                  config.fromPreviousField === "content"
                )}
              >
                Content field
              </button>
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-md">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {config.fromPreviousField === "content" ? (
                <>
                  Reads the <strong>content</strong> field from each
                  item of the previous step and splits by newline to
                  extract URLs.
                  <br />
                  Use after Extract Content that extracts a list of
                  URLs.
                </>
              ) : (
                <>
                  Uses the <strong>URL</strong> from each item of
                  the previous step.
                  <br />
                  Use after Extract URLs to continue with the
                  extracted links.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
