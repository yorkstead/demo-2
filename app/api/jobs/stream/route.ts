import { JobStore } from "@/lib/storage";
import { requireStaff, workspaceId } from "@/lib/access";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = requireStaff(request);
  if (denied) return denied;
  const sessionId = workspaceId(request);
  let initialJobs;
  try {
    initialJobs = await JobStore.getJobs(sessionId);
  } catch {
    return Response.json(
      { error: "Job storage is unavailable." },
      { status: 503 },
    );
  }
  const encoder = new TextEncoder();
  let stop = () => {};
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let timer: ReturnType<typeof setTimeout>;
      let previous = JSON.stringify(initialJobs);
      const send = (event: string, data: unknown) =>
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      stop = () => {
        if (closed) return;
        closed = true;
        clearTimeout(timer);
        request.signal.removeEventListener("abort", stop);
        try {
          controller.close();
        } catch {}
      };
      send("init", { sessionId, jobs: initialJobs });
      const poll = async () => {
        if (closed) return;
        try {
          const jobs = await JobStore.getJobs(sessionId);
          if (closed) return;
          const serialized = JSON.stringify(jobs);
          if (serialized !== previous) {
            send("job_update", { sessionId, jobs });
            previous = serialized;
          } else controller.enqueue(encoder.encode(": keepalive\n\n"));
          timer = setTimeout(poll, 1500);
        } catch {
          stop();
        }
      };
      timer = setTimeout(poll, 1500);
      request.signal.addEventListener("abort", stop, { once: true });
      if (request.signal.aborted) stop();
    },
    cancel() {
      stop();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "private, no-store",
      Connection: "keep-alive",
    },
  });
}
