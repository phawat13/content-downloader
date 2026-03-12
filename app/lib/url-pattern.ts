export function expandUrlPattern(pattern: string): string[] {
  const regex = /\[(\d+)-(\d+)\]/;
  const match = pattern.match(regex);
  if (!match) return [pattern];

  const startStr = match[1];
  const endStr = match[2];
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);
  const padLength = startStr.length;

  const urls: string[] = [];
  const step = start <= end ? 1 : -1;
  for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
    const numStr = i.toString().padStart(padLength, "0");
    urls.push(pattern.replace(regex, numStr));
  }
  return urls;
}
