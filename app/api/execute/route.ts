import { NextRequest } from "next/server";
import { executePipeline } from "@/app/lib/pipeline-engine";
import type { ExecuteRequest, ProgressEvent } from "@/app/lib/types";

export async function POST(req: NextRequest) {
  const body: ExecuteRequest = await req.json();

  if (!body.pipeline?.steps?.length) {
    return Response.json({ error: "Empty pipeline" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: ProgressEvent) => {
        try {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch {
          // Stream may be closed
        }
      };

      try {
        await executePipeline(body.pipeline, emit, body.upToStepIndex);
      } catch (err) {
        emit({
          type: "error",
          message:
            err instanceof Error ? err.message : "Unknown error",
          level: "error",
        });
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
