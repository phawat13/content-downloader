import * as cheerio from "cheerio";
import { expandUrlPattern } from "./url-pattern";
import { resolveFilename } from "./filename-pattern";
import type {
  Pipeline,
  PipelineItem,
  PipelineResult,
  ProgressEvent,
  StepOutput,
  StepOutputItem,
  UrlSourceStep,
  FetchStep,
  ExtractContentStep,
  ExtractUrlsStep,
  VariableExtractStep,
  TranslateStep,
  SaveStep,
  StepType,
} from "./types";

type Emit = (event: ProgressEvent) => void;

const MAX_PREVIEW_ITEMS = 50;
const MAX_CONTENT_PREVIEW = 300;

function buildStepOutput(
  stepIndex: number,
  stepType: StepType,
  items: PipelineItem[]
): StepOutput {
  const previewItems: StepOutputItem[] = items
    .slice(0, MAX_PREVIEW_ITEMS)
    .map((item) => ({
      url: item.url,
      contentPreview: (item.content || item.html).slice(
        0,
        MAX_CONTENT_PREVIEW
      ),
      variables: item.variables,
      status: item.variables._error
        ? ("error" as const)
        : item.html || item.content
          ? ("ok" as const)
          : ("" as const),
      size: (item.content || item.html).length,
    }));

  return {
    stepIndex,
    stepType,
    itemCount: items.length,
    items: previewItems,
  };
}

function buildSaveStepOutput(
  stepIndex: number,
  results: PipelineResult[]
): StepOutput {
  const previewItems: StepOutputItem[] = results
    .slice(0, MAX_PREVIEW_ITEMS)
    .map((r) => ({
      url: r.sourceUrl,
      contentPreview: r.filename,
      variables: r.variables,
      status: "ok" as const,
      size: r.content.length,
    }));

  return {
    stepIndex,
    stepType: "save",
    itemCount: results.length,
    items: previewItems,
  };
}

export async function executePipeline(
  pipeline: Pipeline,
  emit: Emit,
  upToStepIndex?: number
): Promise<void> {
  let items: PipelineItem[] = [];
  const maxStep =
    upToStepIndex !== undefined
      ? Math.min(upToStepIndex, pipeline.steps.length - 1)
      : pipeline.steps.length - 1;

  for (let i = 0; i <= maxStep; i++) {
    const step = pipeline.steps[i];
    emit({
      type: "step-start",
      stepIndex: i,
      stepType: step.type,
      message: `Starting step ${i + 1}: ${step.type}`,
      level: "info",
    });

    try {
      switch (step.type) {
        case "url-source":
          items = executeUrlSource(step, items);
          break;
        case "fetch":
          items = await executeFetch(
            step,
            items,
            (current, total) => {
              emit({
                type: "step-progress",
                stepIndex: i,
                current,
                total,
              });
            },
            emit
          );
          break;
        case "extract-content":
          items = executeExtractContent(step, items, emit);
          break;
        case "extract-urls":
          items = executeExtractUrls(step, items, emit);
          break;
        case "variable-extract":
          items = executeVariableExtract(step, items, emit);
          break;
        case "translate":
          items = await executeTranslate(
            step,
            items,
            (current, total) => {
              emit({
                type: "step-progress",
                stepIndex: i,
                current,
                total,
              });
            },
            emit
          );
          break;
        case "save": {
          const results = buildResults(step, items);
          const stepOutput = buildSaveStepOutput(i, results);
          emit({
            type: "step-complete",
            stepIndex: i,
            stepType: step.type,
            message: `Save step complete: ${results.length} files prepared`,
            level: "success",
          });
          emit({ type: "step-data", stepIndex: i, stepOutput });
          emit({ type: "complete", results });
          return;
        }
      }

      // Emit step output data
      const stepOutput = buildStepOutput(i, step.type, items);
      emit({ type: "step-data", stepIndex: i, stepOutput });

      emit({
        type: "step-complete",
        stepIndex: i,
        stepType: step.type,
        message: `Completed ${step.type}: ${items.length} items`,
        level: "success",
      });
    } catch (err) {
      emit({
        type: "error",
        stepIndex: i,
        message: `Step ${step.type} failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        level: "error",
      });
      return;
    }
  }

  // If we stopped early (upToStepIndex) or no save step
  const results: PipelineResult[] = items.map((item, idx) => ({
    filename: `item-${idx + 1}.txt`,
    content: item.content || item.html,
    variables: item.variables,
    sourceUrl: item.sourceUrl,
  }));
  emit({ type: "complete", results });
}

function executeUrlSource(
  step: UrlSourceStep,
  previousItems: PipelineItem[]
): PipelineItem[] {
  let urls: string[];

  if (step.config.mode === "from-previous") {
    if (previousItems.length === 0) {
      return [];
    }
    const field = step.config.fromPreviousField || "url";
    if (field === "content") {
      // Split content by newlines to get URLs
      urls = previousItems.flatMap((item) =>
        (item.content || "")
          .split("\n")
          .map((u) => u.trim())
          .filter(Boolean)
      );
    } else {
      // Use the url field from each item
      urls = previousItems.map((item) => item.url).filter(Boolean);
    }
  } else if (step.config.mode === "pattern") {
    urls = expandUrlPattern(step.config.pattern);
  } else {
    urls = step.config.urlList
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
  }

  return urls.map((url, index) => ({
    index,
    sourceUrl: url,
    url,
    html: "",
    content: "",
    variables: {},
  }));
}

async function executeFetch(
  step: FetchStep,
  items: PipelineItem[],
  onProgress: (current: number, total: number) => void,
  emit: Emit
): Promise<PipelineItem[]> {
  const { concurrency, delayMs, timeoutMs, headers } = step.config;
  const results: PipelineItem[] = [];
  let completed = 0;

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);

    const batchResults = await Promise.allSettled(
      batch.map(async (item) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetch(item.url, {
            signal: controller.signal,
            headers: {
              "User-Agent": "ContentDownloader/1.0",
              ...headers,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const html = await response.text();
          emit({
            type: "log",
            message: `Fetched ${item.url} (${(html.length / 1024).toFixed(1)} KB)`,
            level: "info",
          });
          return { ...item, html };
        } catch (err) {
          const errMsg =
            err instanceof Error ? err.message : "Fetch failed";
          emit({
            type: "log",
            message: `Failed to fetch ${item.url}: ${errMsg}`,
            level: "warn",
          });
          return {
            ...item,
            html: "",
            variables: { ...item.variables, _error: errMsg },
          };
        } finally {
          clearTimeout(timeout);
        }
      })
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
      completed++;
      onProgress(completed, items.length);
    }

    if (i + concurrency < items.length && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

function executeExtractContent(
  step: ExtractContentStep,
  items: PipelineItem[],
  emit: Emit
): PipelineItem[] {
  return items.map((item) => {
    if (!item.html) return item;

    try {
      const $ = cheerio.load(item.html);
      const elements = $(step.config.selector);

      let content: string;
      if (step.config.attribute) {
        content = elements.attr(step.config.attribute) || "";
      } else if (step.config.outputFormat === "html") {
        content = elements
          .map((_, el) => $(el).html())
          .get()
          .join("\n");
      } else {
        content = elements
          .map((_, el) => {
            // Replace <br>, <br/>, <br /> with newlines
            $(el).find("br").replaceWith("\n");
            // Add newline after each <p> block
            $(el)
              .find("p")
              .each((_, p) => {
                $(p).append("\n");
              });
            return $(el).text();
          })
          .get()
          .join("\n");
      }

      return { ...item, content };
    } catch (err) {
      emit({
        type: "log",
        message: `Extract error on ${item.url}: ${err instanceof Error ? err.message : "Unknown"}`,
        level: "warn",
      });
      return { ...item, content: "" };
    }
  });
}

function executeExtractUrls(
  step: ExtractUrlsStep,
  items: PipelineItem[],
  emit: Emit
): PipelineItem[] {
  const newItems: PipelineItem[] = [];
  let globalIndex = 0;
  const inputField = step.config.inputField || "html";

  for (const item of items) {
    const source = inputField === "content" ? item.content : item.html;
    if (!source) continue;

    try {
      const $ = cheerio.load(source);
      const elements = $(step.config.selector);
      const attr = step.config.attribute || "href";

      elements.each((_, el) => {
        const rawUrl = $(el).attr(attr);
        if (!rawUrl) return;

        let resolvedUrl: string;
        try {
          resolvedUrl = new URL(
            rawUrl,
            step.config.baseUrl || item.url
          ).toString();
        } catch {
          resolvedUrl = rawUrl;
        }

        newItems.push({
          index: globalIndex++,
          sourceUrl: item.url,
          url: resolvedUrl,
          html: "",
          content: "",
          variables: { ...item.variables },
        });
      });
    } catch (err) {
      emit({
        type: "log",
        message: `Extract URLs error on ${item.url}: ${err instanceof Error ? err.message : "Unknown"}`,
        level: "warn",
      });
    }
  }

  emit({
    type: "log",
    message: `Extracted ${newItems.length} URLs from ${items.length} pages`,
    level: "info",
  });

  return newItems;
}

function executeVariableExtract(
  step: VariableExtractStep,
  items: PipelineItem[],
  emit: Emit
): PipelineItem[] {
  return items.map((item) => {
    if (!item.html) return item;

    const newVars = { ...item.variables };

    try {
      const $ = cheerio.load(item.html);

      for (const extraction of step.config.extractions) {
        const el = $(extraction.selector).first();
        let value: string;

        if (extraction.attribute) {
          value = el.attr(extraction.attribute) || "";
        } else {
          value = el.text().trim();
        }

        if (extraction.regex && value) {
          try {
            const match = value.match(new RegExp(extraction.regex));
            if (match) {
              value = match[1] || match[0];
            }
          } catch {
            // Invalid regex, use raw value
          }
        }

        newVars[extraction.variableName] = value;
      }
    } catch (err) {
      emit({
        type: "log",
        message: `Variable extract error on ${item.url}: ${err instanceof Error ? err.message : "Unknown"}`,
        level: "warn",
      });
    }

    return { ...item, variables: newVars };
  });
}

// Map legacy/preview model names to current stable names
const MODEL_ALIASES: Record<string, string> = {
  "gemini-2.5-flash-preview-05-20": "gemini-2.5-flash",
  "gemini-2.5-pro-preview-05-06": "gemini-2.5-pro",
  "gemini-2.5-flash-preview": "gemini-2.5-flash",
  "gemini-2.5-pro-preview": "gemini-2.5-pro",
};

function resolveGeminiModel(model: string): string {
  return MODEL_ALIASES[model] || model || "gemini-2.5-flash";
}

async function executeTranslate(
  step: TranslateStep,
  items: PipelineItem[],
  onProgress: (current: number, total: number) => void,
  emit: Emit
): Promise<PipelineItem[]> {
  const { apiKey, model, sourceLanguage, targetLanguage, concurrency, delayMs, prompt } =
    step.config;
  const results: PipelineItem[] = [];
  let completed = 0;
  const batchSize = Math.max(1, concurrency || 1);

  const systemPrompt =
    prompt ||
    `You are a professional translator. Translate the following text from ${sourceLanguage || "auto-detect"} to ${targetLanguage || "Thai"}. Translate in full detail, do NOT summarize or shorten the content. Preserve the original structure, paragraphs, and line breaks. Only output the translated text, nothing else.`;

  const geminiModel = resolveGeminiModel(model);

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map(async (item) => {
        const text = item.content || item.html;
        if (!text) return item;

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: `${systemPrompt}\n\n---\n\n${text}` }],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 65536,
              },
            }),
          });

          if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Gemini ${response.status}: ${errBody.slice(0, 200)}`);
          }

          const data = await response.json();
          const translated =
            data.candidates?.[0]?.content?.parts?.[0]?.text || "";

          emit({
            type: "log",
            message: `Translated ${item.url} (${text.length} -> ${translated.length} chars)`,
            level: "info",
          });

          return { ...item, content: translated };
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Translation failed";
          emit({
            type: "log",
            message: `Translation error on ${item.url}: ${errMsg}`,
            level: "warn",
          });
          return {
            ...item,
            variables: { ...item.variables, _error: errMsg },
          };
        }
      })
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
      completed++;
      onProgress(completed, items.length);
    }

    if (i + batchSize < items.length && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

function buildResults(
  step: SaveStep,
  items: PipelineItem[]
): PipelineResult[] {
  return items.map((item, idx) => ({
    filename: resolveFilename(step.config.filenamePattern, item, idx),
    content: item.content || item.html,
    variables: item.variables,
    sourceUrl: item.sourceUrl,
  }));
}
