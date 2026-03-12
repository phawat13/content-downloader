import type { PipelineItem } from "./types";

export function resolveFilename(
  pattern: string,
  item: PipelineItem,
  index: number
): string {
  let result = pattern;

  result = result.replace(/\[\*\]/g, String(index + 1));
  result = result.replace(/\[index\]/g, String(index + 1));
  result = result.replace(/\[url\]/g, sanitizeFilename(item.url));
  result = result.replace(
    /\[filename\]/g,
    extractFilenameFromUrl(item.url)
  );

  for (const [key, value] of Object.entries(item.variables)) {
    if (key.startsWith("_")) continue;
    result = result.replace(
      new RegExp(`\\[${escapeRegex(key)}\\]`, "g"),
      sanitizeFilename(value)
    );
  }

  return result;
}

function sanitizeFilename(str: string): string {
  return str.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim();
}

function extractFilenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "index";
    return last.replace(/\.[^.]+$/, "");
  } catch {
    return "unknown";
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
