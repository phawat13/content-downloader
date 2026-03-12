import { NextRequest } from "next/server";
import archiver from "archiver";
import { PassThrough } from "stream";
import type { DownloadRequest } from "@/app/lib/types";

export async function POST(req: NextRequest) {
  const body: DownloadRequest = await req.json();

  if (!body.results?.length) {
    return Response.json(
      { error: "No results to download" },
      { status: 400 }
    );
  }

  const passthrough = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 5 } });

  archive.pipe(passthrough);

  for (const result of body.results) {
    const safeName = result.filename
      .replace(/\.\./g, "_")
      .replace(/^[/\\]+/, "");
    archive.append(result.content, { name: safeName });
  }

  archive.finalize();

  const webStream = new ReadableStream({
    start(controller) {
      passthrough.on("data", (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      passthrough.on("end", () => {
        controller.close();
      });
      passthrough.on("error", (err) => {
        controller.error(err);
      });
    },
  });

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition":
        'attachment; filename="content-download.zip"',
    },
  });
}
