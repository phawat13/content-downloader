import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import type { PipelineConfig } from "@/app/lib/types";

const CONFIG_DIR = path.join(process.cwd(), "pipeline-configs");

async function ensureConfigDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-.\u0E00-\u0E7F ]/g, "_").slice(0, 100);
}

// GET: List all saved configs or load a specific one
export async function GET(request: NextRequest) {
  try {
    await ensureConfigDir();
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");

    if (name) {
      // Load specific config
      const safeName = sanitizeFilename(name);
      const filePath = path.join(CONFIG_DIR, `${safeName}.json`);
      const content = await fs.readFile(filePath, "utf-8");
      const config: PipelineConfig = JSON.parse(content);
      return NextResponse.json({ success: true, config });
    }

    // List all configs
    const files = await fs.readdir(CONFIG_DIR);
    const configs: Array<{
      name: string;
      filename: string;
      updatedAt: string;
      stepCount: number;
    }> = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const content = await fs.readFile(
          path.join(CONFIG_DIR, file),
          "utf-8"
        );
        const config: PipelineConfig = JSON.parse(content);
        configs.push({
          name: config.name,
          filename: file,
          updatedAt: config.updatedAt,
          stepCount: config.steps.length,
        });
      } catch {
        // Skip invalid files
      }
    }

    configs.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({ success: true, configs });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to load configs",
      },
      { status: 500 }
    );
  }
}

// POST: Save a pipeline config
export async function POST(request: NextRequest) {
  try {
    await ensureConfigDir();
    const body = await request.json();
    const { name, steps } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (!steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { success: false, error: "Steps array is required" },
        { status: 400 }
      );
    }

    const safeName = sanitizeFilename(name);
    const filePath = path.join(CONFIG_DIR, `${safeName}.json`);

    // Check if file exists to preserve createdAt
    let createdAt = new Date().toISOString();
    try {
      const existing = await fs.readFile(filePath, "utf-8");
      const parsed: PipelineConfig = JSON.parse(existing);
      createdAt = parsed.createdAt;
    } catch {
      // New file
    }

    const config: PipelineConfig = {
      name,
      version: 1,
      createdAt,
      updatedAt: new Date().toISOString(),
      steps,
    };

    await fs.writeFile(filePath, JSON.stringify(config, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      filename: `${safeName}.json`,
      config,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save config",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove a saved config
export async function DELETE(request: NextRequest) {
  try {
    await ensureConfigDir();
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const safeName = sanitizeFilename(name);
    const filePath = path.join(CONFIG_DIR, `${safeName}.json`);

    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete config",
      },
      { status: 500 }
    );
  }
}
