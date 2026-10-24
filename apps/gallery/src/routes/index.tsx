import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { galleryBlocks } from "~/blocks";
import { approvalCard } from "~/blocks/approval-card";
import type { DemoEvent } from "~/blocks/types";
import { Segmented } from "~/components/segmented";
import { Thread, palettes, type Palette, type SentEvent } from "~/components/thread";
import { pageHead } from "~/site";

export const Route = createFileRoute("/")({
  loader: () => ({ now: Date.now() }),
  head: () =>
    pageHead({
      title: "Inlay: views agents show instead of chat text",
      description:
        "Open React blocks for agent apps. The agent sends data with one tool call, and your app draws it in your own theme.",
      path: "/",
    }),
  component: Home,
});

function Home() {
  const { now } = Route.useLoaderData();
  const [sent, setSent] = useState<readonly SentEvent[]>([]);
  const [palette, setPalette] = useState<Palette>("neutral");
  const sample = approvalCard.samples(now)[0];

  function handleEvent(event: DemoEvent) {
    setSent((events) => [...events, { ...event, id: events.length }]);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-5 pt-12 sm:px-8 sm:pt-20">
      <section aria-labelledby="intro" className="flex flex-col gap-10">
        <div className="flex max-w-2xl flex-col gap-5">
          <h1 id="intro" className="text-4xl font-semibold text-balance sm:text-5xl">
            Views agents show instead of chat text.
          </h1>
          <p className="text-lg text-pretty text-muted-foreground">
            Inlay is a set of open React blocks. The agent sends data with one tool call, your app
            draws it with parts it owns, and a click goes back to the agent as the next message.
          </p>
          <p className="text-sm">
            <Link
              to="/manifesto"
              className="font-medium underline decoration-border underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-foreground"
            >
              Why chat is not enough
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <p className="text-sm text-pretty text-muted-foreground">
              The block takes its colors, radius and type from the app it lives in.
            </p>
            <Segmented legend="Theme" value={palette} options={palettes} onChange={setPalette} />
          </div>
          <Thread sample={sample} palette={palette} sent={sent} onEvent={handleEvent} />
        </div>
      </section>

      <section aria-labelledby="blocks" className="flex flex-col gap-6">
        <h2 id="blocks" className="text-lg font-semibold">
          The blocks
        </h2>
        <ol className="flex flex-col border-t">
          {galleryBlocks.map((block, index) => (
            <li key={block.name} className="border-b">
              <Link
                to="/blocks/$name"
                params={{ name: block.name }}
                className="group grid grid-cols-[2rem_1fr] gap-x-4 gap-y-1 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:grid-cols-[2.5rem_14rem_1fr] sm:items-baseline"
              >
                <span className="font-mono text-sm text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  translate="no"
                  className="font-mono text-[15px] font-medium underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-150 group-hover:decoration-foreground"
                >
                  {block.name}
                </span>
                <span className="col-start-2 text-pretty text-muted-foreground sm:col-start-3">
                  {block.summary}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
