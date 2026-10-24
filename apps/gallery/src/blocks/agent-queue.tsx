import { AgentQueue } from "@inlay/blocks/agent-queue/agent-queue.tsx";
import type { AgentQueueData } from "@inlay/blocks/agent-queue/data.ts";
import typeSource from "@inlay/blocks/agent-queue/data.ts?raw";
import { empty, finished, longText, many, release } from "@inlay/blocks/agent-queue/examples.ts";

import type { DemoSample, GalleryBlock } from "./types";

function sample(
  fields: Omit<DemoSample, "render" | "data"> & { data: AgentQueueData },
): DemoSample {
  return { ...fields, render: () => <AgentQueue data={fields.data} /> };
}

export const agentQueue: GalleryBlock = {
  name: "agent-queue",
  title: "Agent queue",
  summary: "Jobs waiting, running and done, per worker.",
  description:
    "When an agent fans work out to several workers, the queue shows what each one is doing, what waits, and what failed, with live timings.",
  takes: "Jobs with status, worker and timings",
  seenIn: "Flo’s queue component, Cline Kanban",
  callback: null,
  typeSource,
  samples: (now) => [
    sample({
      id: "typical",
      label: "Typical",
      prompt: "Switch all three services to the new logger.",
      lead: "I split it across three workers. One job failed, the rest are moving.",
      data: release(now),
    }),
    sample({
      id: "many",
      label: "38 jobs",
      prompt: "Upgrade TypeScript in every package and fix what breaks.",
      lead: "Twelve packages are done. The type errors are queued behind the last four.",
      data: many(now),
    }),
    sample({
      id: "long",
      label: "Long text",
      prompt: "Reconcile last quarter’s payouts.",
      lead: "This one runs for a while. The email step failed.",
      data: longText(now),
    }),
    sample({
      id: "finished",
      label: "Finished",
      prompt: "Clean up the docs site.",
      lead: "Done, except the preview deploy.",
      data: finished(now),
    }),
    sample({
      id: "empty",
      label: "Empty",
      prompt: "What are the workers doing?",
      lead: "Nothing right now.",
      data: empty(now),
    }),
  ],
};
