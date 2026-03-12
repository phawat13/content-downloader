import { NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { SaveRequest } from "@/app/lib/types";

export async function POST(req: NextRequest) {
  const body: SaveRequest = await req.json();
  const { results, serverPath } = body;

  if (!serverPath || !path.isAbsolute(serverPath)) {
    return Response.json(
      { error: "serverPath must be an absolute path" },
      { status: 400 }
    );
  }

  if (!results?.length) {
    return Response.json(
      { error: "No results to save" },
      { status: 400 }
    );
  }

  try {
    await mkdir(serverPath, { recursive: true });
  } catch (err) {
    return Response.json(
      {
        error: `Cannot create directory: ${(err as Error).message}`,
      },
      { status: 500 }
    );
  }

  const errors: string[] = [];
  let savedCount = 0;

  for (const result of results) {
    try {
      const safeName = result.filename
        .replace(/\.\./g, "_")
        .replace(/^[/\\]+/, "");
      const fullPath = path.join(serverPath, safeName);

      // Ensure subdirectories exist if filename has slashes
      const dir = path.dirname(fullPath);
      await mkdir(dir, { recursive: true });

      await writeFile(fullPath, result.content, "utf-8");
      savedCount++;
    } catch (err) {
      errors.push(`${result.filename}: ${(err as Error).message}`);
    }
  }

  return Response.json({ success: true, savedCount, errors });
}
