"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  PipelineStep,
  StepType,
  PipelineResult,
  LogEntry,
  ProgressEvent,
  StepOutput,
  PipelineConfig,
} from "@/app/lib/types";
import StepCard, { StepConnector } from "./StepCard";
import AddStepButton from "./AddStepButton";
import ExecutionPanel from "./ExecutionPanel";
import UrlSourceStep from "./steps/UrlSourceStep";
import FetchStep from "./steps/FetchStep";
import ExtractContentStep from "./steps/ExtractContentStep";
import ExtractUrlsStep from "./steps/ExtractUrlsStep";
import VariableExtractStep from "./steps/VariableExtractStep";
import TranslateStep from "./steps/TranslateStep";
import SaveStep from "./steps/SaveStep";
import PipelineToolbar from "./PipelineToolbar";

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function createDefaultStep(type: StepType): PipelineStep {
  const id = createId();
  switch (type) {
    case "url-source":
      return {
        id,
        type,
        config: {
          mode: "pattern",
          pattern: "",
          urlList: "",
          fromPreviousField: "url",
        },
      };
    case "fetch":
      return {
        id,
        type,
        config: {
          concurrency: 3,
          delayMs: 200,
          timeoutMs: 10000,
          headers: {},
        },
      };
    case "extract-content":
      return {
        id,
        type,
        config: { selector: "", attribute: "", outputFormat: "text" },
      };
    case "extract-urls":
      return {
        id,
        type,
        config: {
          selector: "a",
          attribute: "href",
          baseUrl: "",
          inputField: "html",
          urlFilter: "",
          urlFilterIsRegex: false,
        },
      };
    case "variable-extract":
      return {
        id,
        type,
        config: {
          extractions: [
            {
              variableName: "",
              selector: "",
              attribute: "",
              regex: "",
            },
          ],
        },
      };
    case "translate":
      return {
        id,
        type,
        config: {
          apiKey: "",
          model: "gemini-2.5-flash",
          sourceLanguage: "",
          targetLanguage: "Thai",
          concurrency: 1,
          delayMs: 500,
          prompt: "",
        },
      };
    case "save":
      return {
        id,
        type,
        config: {
          mode: "both",
          serverPath: "",
          filenamePattern: "content-[*].txt",
        },
      };
  }
}

export default function PipelineBuilder() {
  const [steps, setSteps] = useState<PipelineStep[]>([
    createDefaultStep("url-source"),
    createDefaultStep("fetch"),
    createDefaultStep("extract-content"),
    createDefaultStep("save"),
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [runningStepIndex, setRunningStepIndex] = useState<number | null>(
    null
  );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<PipelineResult[] | null>(null);
  const [progress, setProgress] = useState<{
    stepIndex: number;
    current: number;
    total: number;
  } | null>(null);
  const [stepOutputs, setStepOutputs] = useState<
    Record<number, StepOutput>
  >({});
  const [configName, setConfigName] = useState("untitled");
  const [savedConfigs, setSavedConfigs] = useState<
    Array<{ name: string; filename: string; updatedAt: string; stepCount: number }>
  >([]);
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved config list on mount
  useEffect(() => {
    fetchSavedConfigs();
  }, []);

  const fetchSavedConfigs = async () => {
    try {
      const res = await fetch("/api/pipeline-config");
      const data = await res.json();
      if (data.success) setSavedConfigs(data.configs);
    } catch {
      // Silently fail
    }
  };

  const handleSaveConfig = async (name: string) => {
    try {
      const res = await fetch("/api/pipeline-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, steps }),
      });
      const data = await res.json();
      if (data.success) {
        setConfigName(name);
        await fetchSavedConfigs();
        setLogs((prev) => [
          ...prev,
          {
            timestamp: Date.now(),
            level: "success",
            message: `Pipeline saved as "${name}"`,
          },
        ]);
      }
    } catch (err) {
      setLogs((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          level: "error",
          message: `Save config error: ${err instanceof Error ? err.message : "Unknown"}`,
        },
      ]);
    }
  };

  const handleLoadConfig = async (name: string) => {
    try {
      const res = await fetch(`/api/pipeline-config?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.success && data.config) {
        const config: PipelineConfig = data.config;
        setSteps(config.steps);
        setConfigName(config.name);
        setStepOutputs({});
        setResults(null);
        setLogs((prev) => [
          ...prev,
          {
            timestamp: Date.now(),
            level: "success",
            message: `Loaded pipeline "${config.name}" (${config.steps.length} steps)`,
          },
        ]);
      }
    } catch (err) {
      setLogs((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          level: "error",
          message: `Load config error: ${err instanceof Error ? err.message : "Unknown"}`,
        },
      ]);
    }
  };

  const handleDeleteConfig = async (name: string) => {
    try {
      const res = await fetch("/api/pipeline-config", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSavedConfigs();
        setLogs((prev) => [
          ...prev,
          {
            timestamp: Date.now(),
            level: "info",
            message: `Deleted config "${name}"`,
          },
        ]);
      }
    } catch {
      // Silently fail
    }
  };

  const handleDownloadConfig = () => {
    const config: PipelineConfig = {
      name: configName,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${configName.replace(/[^a-zA-Z0-9_\-]/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const config: PipelineConfig = JSON.parse(ev.target?.result as string);
        if (config.steps && Array.isArray(config.steps)) {
          setSteps(config.steps);
          setConfigName(config.name || file.name.replace(/\.json$/, ""));
          setStepOutputs({});
          setResults(null);
          setLogs((prev) => [
            ...prev,
            {
              timestamp: Date.now(),
              level: "success",
              message: `Loaded pipeline from file "${file.name}" (${config.steps.length} steps)`,
            },
          ]);
        } else {
          throw new Error("Invalid config format");
        }
      } catch (err) {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: Date.now(),
            level: "error",
            message: `Invalid config file: ${err instanceof Error ? err.message : "Unknown"}`,
          },
        ]);
      }
    };
    reader.readAsText(file);
    // Reset so re-selecting the same file works
    e.target.value = "";
  };

  const addStep = useCallback((type: StepType) => {
    setSteps((prev) => [...prev, createDefaultStep(type)]);
  }, []);

  const removeStep = useCallback((id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateStepConfig = useCallback(
    (id: string, configUpdate: Record<string, unknown>) => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                config: { ...s.config, ...configUpdate } as never,
              }
            : s
        )
      );
    },
    []
  );

  const moveStep = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= steps.length) return;
      setSteps((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [steps.length]
  );

  const handleProgressEvent = useCallback((event: ProgressEvent) => {
    switch (event.type) {
      case "step-start":
      case "step-complete":
      case "log":
        setLogs((prev) => [
          ...prev,
          {
            timestamp: Date.now(),
            level: event.level || "info",
            message:
              event.message ||
              `${event.type} - ${event.stepType || ""}`,
          },
        ]);
        break;
      case "step-progress":
        setProgress({
          stepIndex: event.stepIndex ?? 0,
          current: event.current ?? 0,
          total: event.total ?? 0,
        });
        break;
      case "step-data":
        if (event.stepOutput) {
          setStepOutputs((prev) => ({
            ...prev,
            [event.stepOutput!.stepIndex]: event.stepOutput!,
          }));
        }
        break;
      case "complete":
        setResults(event.results || []);
        setProgress(null);
        setLogs((prev) => [
          ...prev,
          {
            timestamp: Date.now(),
            level: "success",
            message: `Pipeline complete! ${event.results?.length || 0} files ready.`,
          },
        ]);
        break;
      case "error":
        setLogs((prev) => [
          ...prev,
          {
            timestamp: Date.now(),
            level: "error",
            message: event.message || "Unknown error",
          },
        ]);
        break;
    }
  }, []);

  const consumeSSE = useCallback(
    async (response: Response) => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (part.startsWith("data: ")) {
            try {
              const event: ProgressEvent = JSON.parse(part.slice(6));
              handleProgressEvent(event);
            } catch {
              // Invalid JSON, skip
            }
          }
        }
      }
    },
    [handleProgressEvent]
  );

  const executeUpTo = useCallback(
    async (upToStepIndex: number) => {
      setIsExecuting(true);
      setRunningStepIndex(upToStepIndex);
      setLogs([]);
      setResults(null);
      setProgress(null);
      // Clear outputs for steps >= upToStepIndex that will be re-run
      setStepOutputs((prev) => {
        const next = { ...prev };
        for (let i = 0; i <= upToStepIndex; i++) {
          delete next[i];
        }
        return next;
      });

      try {
        const response = await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pipeline: { steps },
            upToStepIndex,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          handleProgressEvent({
            type: "error",
            message: err.error || `HTTP ${response.status}`,
            level: "error",
          });
        } else {
          await consumeSSE(response);
        }
      } catch (err) {
        handleProgressEvent({
          type: "error",
          message:
            err instanceof Error
              ? err.message
              : "Failed to connect to server",
          level: "error",
        });
      }

      setIsExecuting(false);
      setRunningStepIndex(null);
    },
    [steps, handleProgressEvent, consumeSSE]
  );

  const execute = useCallback(async () => {
    await executeUpTo(steps.length - 1);
  }, [steps.length, executeUpTo]);

  const handleSaveToServer = useCallback(
    async (path: string) => {
      if (!results) return;
      try {
        const response = await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ results, serverPath: path }),
        });
        const data = await response.json();
        if (data.success) {
          setLogs((prev) => [
            ...prev,
            {
              timestamp: Date.now(),
              level: "success",
              message: `Saved ${data.savedCount} files to ${path}${data.errors?.length ? `. Errors: ${data.errors.join(", ")}` : ""}`,
            },
          ]);
        } else {
          setLogs((prev) => [
            ...prev,
            {
              timestamp: Date.now(),
              level: "error",
              message: `Save failed: ${data.error}`,
            },
          ]);
        }
      } catch (err) {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: Date.now(),
            level: "error",
            message: `Save error: ${err instanceof Error ? err.message : "Unknown"}`,
          },
        ]);
      }
    },
    [results]
  );

  const handleDownloadZip = useCallback(async () => {
    if (!results) return;
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "content-download.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLogs((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          level: "success",
          message: "Zip file downloaded!",
        },
      ]);
    } catch (err) {
      setLogs((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          level: "error",
          message: `Download error: ${err instanceof Error ? err.message : "Unknown"}`,
        },
      ]);
    }
  }, [results]);

  const renderStepConfig = (step: PipelineStep) => {
    switch (step.type) {
      case "url-source":
        return (
          <UrlSourceStep
            config={step.config}
            onUpdate={(c) => updateStepConfig(step.id, c)}
          />
        );
      case "fetch":
        return (
          <FetchStep
            config={step.config}
            onUpdate={(c) => updateStepConfig(step.id, c)}
          />
        );
      case "extract-content":
        return (
          <ExtractContentStep
            config={step.config}
            onUpdate={(c) => updateStepConfig(step.id, c)}
          />
        );
      case "extract-urls":
        return (
          <ExtractUrlsStep
            config={step.config}
            onUpdate={(c) => updateStepConfig(step.id, c)}
          />
        );
      case "variable-extract":
        return (
          <VariableExtractStep
            config={step.config}
            onUpdate={(c) => updateStepConfig(step.id, c)}
          />
        );
      case "translate":
        return (
          <TranslateStep
            config={step.config}
            onUpdate={(c) => updateStepConfig(step.id, c)}
          />
        );
      case "save":
        return (
          <SaveStep
            config={step.config}
            onUpdate={(c) => updateStepConfig(step.id, c)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-7xl mx-auto min-h-screen">
      {/* Pipeline Builder */}
      <div className="flex-1 lg:max-w-[58%]">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Content Downloader
          </h1>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Pipeline Builder
          </span>
        </div>

        <PipelineToolbar
          configName={configName}
          onConfigNameChange={setConfigName}
          savedConfigs={savedConfigs}
          onSave={handleSaveConfig}
          onLoad={handleLoadConfig}
          onDelete={handleDeleteConfig}
          onDownload={handleDownloadConfig}
          onUploadClick={() => fileInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleUploadConfig}
        />

        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={step.id}>
              {index > 0 && <StepConnector />}
              <StepCard
                step={step}
                index={index}
                totalSteps={steps.length}
                onRemove={() => removeStep(step.id)}
                onMoveUp={() => moveStep(index, index - 1)}
                onMoveDown={() => moveStep(index, index + 1)}
                onRunToHere={() => executeUpTo(index)}
                isRunning={
                  isExecuting &&
                  runningStepIndex !== null &&
                  index <= runningStepIndex
                }
                stepOutput={stepOutputs[index] ?? null}
              >
                {renderStepConfig(step)}
              </StepCard>
            </div>
          ))}
        </div>

        <AddStepButton onAdd={addStep} />
      </div>

      {/* Execution Panel */}
      <div className="lg:flex-1 lg:sticky lg:top-6 lg:self-start">
        <ExecutionPanel
          isExecuting={isExecuting}
          logs={logs}
          results={results}
          progress={progress}
          onExecute={execute}
          onSaveToServer={handleSaveToServer}
          onDownloadZip={handleDownloadZip}
        />
      </div>
    </div>
  );
}
