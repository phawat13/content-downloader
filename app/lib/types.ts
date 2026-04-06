export type StepType =
  | "url-source"
  | "fetch"
  | "extract-content"
  | "extract-urls"
  | "variable-extract"
  | "translate"
  | "save";

export interface BaseStep {
  id: string;
  type: StepType;
}

export interface UrlSourceStep extends BaseStep {
  type: "url-source";
  config: {
    mode: "pattern" | "list" | "from-previous" | "from-file";
    pattern: string;
    urlList: string;
    fromPreviousField: "url" | "content";
    files: Array<{ name: string; content: string }>;
  };
}

export interface FetchStep extends BaseStep {
  type: "fetch";
  config: {
    concurrency: number;
    delayMs: number;
    timeoutMs: number;
    headers: Record<string, string>;
    scrollToBottom: boolean;
    scrollDelay: number;
    maxScrolls: number;
    waitForSelector: string;
  };
}

export interface ExtractContentStep extends BaseStep {
  type: "extract-content";
  config: {
    selector: string;
    attribute: string;
    outputFormat: "text" | "html";
  };
}

export interface ExtractUrlsStep extends BaseStep {
  type: "extract-urls";
  config: {
    selector: string;
    attribute: string;
    baseUrl: string;
    inputField: "html" | "content";
    urlFilter: string;
    urlFilterIsRegex: boolean;
  };
}

export interface VariableExtractStep extends BaseStep {
  type: "variable-extract";
  config: {
    extractions: Array<{
      variableName: string;
      selector: string;
      attribute: string;
      regex: string;
    }>;
  };
}

export interface TranslateStep extends BaseStep {
  type: "translate";
  config: {
    apiKey: string;
    model: string;
    sourceLanguage: string;
    targetLanguage: string;
    concurrency: number;
    delayMs: number;
    prompt: string;
  };
}

export interface SaveStep extends BaseStep {
  type: "save";
  config: {
    mode: "server" | "download" | "both";
    serverPath: string;
    filenamePattern: string;
  };
}

export type PipelineStep =
  | UrlSourceStep
  | FetchStep
  | ExtractContentStep
  | ExtractUrlsStep
  | VariableExtractStep
  | TranslateStep
  | SaveStep;

export interface Pipeline {
  steps: PipelineStep[];
}

export interface PipelineItem {
  index: number;
  sourceUrl: string;
  url: string;
  html: string;
  content: string;
  variables: Record<string, string>;
}

export type LogLevel = "info" | "warn" | "error" | "success";

export interface StepOutputItem {
  url: string;
  contentPreview: string;
  variables: Record<string, string>;
  status: "ok" | "error" | "";
  size: number;
}

export interface StepOutput {
  stepIndex: number;
  stepType: StepType;
  itemCount: number;
  items: StepOutputItem[];
}

export interface ProgressEvent {
  type:
    | "step-start"
    | "step-progress"
    | "step-complete"
    | "step-data"
    | "item-done"
    | "log"
    | "error"
    | "complete";
  stepIndex?: number;
  stepType?: StepType;
  current?: number;
  total?: number;
  message?: string;
  level?: LogLevel;
  results?: PipelineResult[];
  stepOutput?: StepOutput;
}

export interface PipelineResult {
  filename: string;
  content: string;
  variables: Record<string, string>;
  sourceUrl: string;
}

export interface ExecuteRequest {
  pipeline: Pipeline;
  upToStepIndex?: number;
}

export interface SaveRequest {
  results: PipelineResult[];
  serverPath: string;
}

export interface DownloadRequest {
  results: PipelineResult[];
}

export interface PipelineConfig {
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  steps: PipelineStep[];
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
}

export const STEP_META: Record<
  StepType,
  { label: string; color: string; bgColor: string; description: string }
> = {
  "url-source": {
    label: "URL Source",
    color: "border-blue-500",
    bgColor: "bg-blue-500",
    description: "Define source URLs with pattern or list",
  },
  fetch: {
    label: "Fetch",
    color: "border-green-500",
    bgColor: "bg-green-500",
    description: "Fetch HTML content from URLs",
  },
  "extract-content": {
    label: "Extract Content",
    color: "border-purple-500",
    bgColor: "bg-purple-500",
    description: "Extract text/HTML using CSS selector",
  },
  "extract-urls": {
    label: "Extract URLs",
    color: "border-orange-500",
    bgColor: "bg-orange-500",
    description: "Extract links for chained fetching",
  },
  "variable-extract": {
    label: "Variable Extract",
    color: "border-teal-500",
    bgColor: "bg-teal-500",
    description: "Extract named variables from content",
  },
  translate: {
    label: "Translate",
    color: "border-sky-500",
    bgColor: "bg-sky-500",
    description: "Translate content using Gemini AI",
  },
  save: {
    label: "Save",
    color: "border-red-500",
    bgColor: "bg-red-500",
    description: "Save results to files",
  },
};
