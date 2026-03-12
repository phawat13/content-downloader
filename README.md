# Content Downloader

A visual web scraping pipeline builder. Define a sequence of steps to fetch, extract, transform, and save content from the web — all through a browser-based UI.

## Features

- **Visual Pipeline Builder** — Add, remove, and reorder steps with a drag-friendly UI
- **Run to step** — Execute the pipeline up to any specific step for incremental testing
- **Real-time progress** — Live logs and progress via Server-Sent Events (SSE)
- **Pipeline configs** — Save/load pipelines to the server or export/import as JSON files
- **Download results** — Save files to the server path or download as a ZIP archive

## Pipeline Steps

| Step | Description |
|------|-------------|
| **URL Source** | Define source URLs via pattern (e.g. `https://example.com/page-[1-100]`), a manual list, or from a previous step's output |
| **Fetch** | HTTP fetch URLs with configurable concurrency, delay, timeout, and custom headers |
| **Extract Content** | Extract text or HTML from a CSS selector |
| **Extract URLs** | Extract links from a page for chained fetching |
| **Variable Extract** | Extract named variables using CSS selectors, attributes, or regex |
| **Translate** | Translate content using Gemini AI (configurable model, language, prompt, concurrency) |
| **Save** | Save results to server path and/or download as ZIP, with a filename pattern |

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) v4
- [Cheerio](https://cheerio.js.org) — HTML parsing for content/URL extraction
- [Archiver](https://www.archiverjs.com) — ZIP file creation
- TypeScript

## Project Structure

```
app/
├── api/
│   ├── execute/      # SSE pipeline execution endpoint
│   ├── download/     # ZIP download endpoint
│   ├── save/         # Server-side file save endpoint
│   └── pipeline-config/  # Pipeline config CRUD
├── components/
│   ├── PipelineBuilder.tsx   # Main pipeline UI
│   ├── StepCard.tsx          # Individual step container
│   ├── ExecutionPanel.tsx    # Logs, progress, and result actions
│   ├── PipelineToolbar.tsx   # Save/load config toolbar
│   └── steps/                # Step-specific config components
├── lib/
│   ├── types.ts              # Shared TypeScript types
│   ├── pipeline-engine.ts    # Core execution logic
│   ├── url-pattern.ts        # URL pattern expansion
│   └── filename-pattern.ts   # Filename pattern resolution
└── pipeline-configs/         # Saved pipeline JSON files
```
