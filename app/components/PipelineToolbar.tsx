"use client";

import { useState, useRef, useEffect } from "react";

interface SavedConfig {
  name: string;
  filename: string;
  updatedAt: string;
  stepCount: number;
}

interface PipelineToolbarProps {
  configName: string;
  onConfigNameChange: (name: string) => void;
  savedConfigs: SavedConfig[];
  onSave: (name: string) => void;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
  onDownload: () => void;
  onUploadClick: () => void;
}

export default function PipelineToolbar({
  configName,
  onConfigNameChange,
  savedConfigs,
  onSave,
  onLoad,
  onDelete,
  onDownload,
  onUploadClick,
}: PipelineToolbarProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [saveName, setSaveName] = useState(configName);
  const loadMenuRef = useRef<HTMLDivElement>(null);
  const saveDialogRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        loadMenuRef.current &&
        !loadMenuRef.current.contains(e.target as Node)
      ) {
        setShowLoadMenu(false);
      }
      if (
        saveDialogRef.current &&
        !saveDialogRef.current.contains(e.target as Node)
      ) {
        setShowSaveDialog(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSave = () => {
    setSaveName(configName);
    setShowSaveDialog(true);
  };

  const handleConfirmSave = () => {
    if (saveName.trim()) {
      onSave(saveName.trim());
      onConfigNameChange(saveName.trim());
      setShowSaveDialog(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      {/* Current config name */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 min-w-0">
        <svg
          className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate max-w-[150px]">
          {configName}
        </span>
      </div>

      {/* Save button */}
      <div className="relative" ref={saveDialogRef}>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          title="Save to server"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          Save
        </button>

        {showSaveDialog && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-3 w-64">
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Pipeline Name
            </label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmSave()}
              className="w-full px-2.5 py-1.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
              autoFocus
              placeholder="my-pipeline"
            />
            <div className="flex gap-2">
              <button
                onClick={handleConfirmSave}
                className="flex-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Load from server */}
      <div className="relative" ref={loadMenuRef}>
        <button
          onClick={() => setShowLoadMenu(!showLoadMenu)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors"
          title="Load from server"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          Load
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showLoadMenu && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl w-72 max-h-64 overflow-y-auto">
            {savedConfigs.length === 0 ? (
              <div className="p-3 text-xs text-zinc-400 text-center">
                No saved pipelines
              </div>
            ) : (
              savedConfigs.map((cfg) => (
                <div
                  key={cfg.filename}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 border-b border-zinc-100 dark:border-zinc-700/50 last:border-0 group"
                >
                  <button
                    onClick={() => {
                      onLoad(cfg.name);
                      setShowLoadMenu(false);
                    }}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {cfg.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      {cfg.stepCount} steps · {formatDate(cfg.updatedAt)}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(cfg.name);
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-600" />

      {/* Download as JSON */}
      <button
        onClick={onDownload}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors"
        title="Download pipeline as JSON file"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export
      </button>

      {/* Upload JSON */}
      <button
        onClick={onUploadClick}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors"
        title="Load pipeline from JSON file"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        Import
      </button>
    </div>
  );
}
