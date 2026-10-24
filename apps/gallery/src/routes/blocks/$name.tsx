import { cn } from "@inlay/blocks/lib/utils.ts";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { findBlock } from "~/blocks";
import type { DemoEvent, DemoSample, GalleryBlock } from "~/blocks/types";
import { Code } from "~/components/code";
import { Segmented } from "~/components/segmented";
import { Thread, palettes, type Palette, type SentEvent } from "~/components/thread";
import { pageHead } from "~/site";

const searchSchema = z.object({
  sample: z.string().optional().catch(undefined),
  palette: z.enum(["neutral", "paper", "harbor"]).optional().catch(undefined),
});

export const Route = createFileRoute("/blocks/$name")({
  validateSearch: searchSchema,
  loader: ({ params }) => {
    if (findBlock(params.name) === undefined) {
      throw notFound();
    }
    return { now: Date.now() };
  },
  head: ({ params }) => {
    const found = findBlock(params.name);
    if (found === undefined) {
      return {
        meta: [{ title: "Block not found · Inlay" }, { name: "robots", content: "noindex" }],
      };
    }
    return pageHead({
      title: `${found.block.title} · Inlay`,
      description: found.block.summary,
      path: `/blocks/${found.block.name}`,
      image: `/og/${found.block.name}.png`,
      imageAlt: `The ${found.block.name} block inside an agent thread`,
    });
  },
  component: BlockPage,
});

function BlockPage() {
  const { name } = Route.useParams();
  const { now } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const found = findBlock(name);
  if (found === undefined) {
    return null;
  }
  const { block, previous, next } = found;
  const samples = block.samples(now);
  const sample = samples.find((item) => item.id === search.sample) ?? samples[0];
  const palette = search.palette ?? "neutral";

  function update(changes: { sample?: string; palette?: Palette }) {
    void navigate({
      search: (prev) => ({ ...prev, ...changes }),
      replace: true,
      resetScroll: false,
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-5 pt-10 sm:px-8 sm:pt-16">
      <header className="flex max-w-2xl flex-col gap-4">
        <p translate="no" className="font-mono text-sm text-muted-foreground">
          {block.name}
        </p>
        <h1 className="text-3xl font-semibold text-balance sm:text-4xl">{block.title}</h1>
        <p className="text-lg text-pretty text-muted-foreground">{block.description}</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Takes</dt>
          <dd>{block.takes}</dd>
          <dt className="text-muted-foreground">Sends back</dt>
          <dd>
            {block.callback === null ? (
              "Nothing. It only shows data."
            ) : (
              <code translate="no" className="font-mono text-[13px]">
                {block.callback}
              </code>
            )}
          </dd>
          <dt className="text-muted-foreground">Seen in</dt>
          <dd>{block.seenIn}</dd>
        </dl>
      </header>

      <Demo
        key={sample.id}
        block={block}
        sample={sample}
        samples={samples}
        palette={palette}
        onChange={update}
      />

      <section aria-labelledby="call" className="flex flex-col gap-4">
        <SectionHeading id="call" title="What the agent sends">
          One tool call with the block name and data. The app draws the block with its own theme.
        </SectionHeading>
        <Code
          label="show_view call"
          code={`show_view("${block.name}", ${JSON.stringify(sample.data, null, 2)})`}
        />
      </section>

      <section aria-labelledby="type" className="flex flex-col gap-4">
        <SectionHeading id="type" title="Data shape">
          The type the block accepts. A Zod schema replaces it in the next milestone, so the server
          can reject data that does not match.
        </SectionHeading>
        <Code label="data type" code={block.typeSource.trim()} capped={false} />
      </section>

      <nav aria-label="Other blocks" className="grid grid-cols-2 gap-4 border-t pt-6 text-sm">
        {previous === undefined ? null : <PagerLink block={previous} direction="Previous" />}
        {next === undefined ? null : <PagerLink block={next} direction="Next" />}
      </nav>
    </main>
  );
}

type DemoProps = {
  block: GalleryBlock;
  sample: DemoSample;
  samples: readonly DemoSample[];
  palette: Palette;
  onChange: (changes: { sample?: string; palette?: Palette }) => void;
};

function Demo({ block, sample, samples, palette, onChange }: DemoProps) {
  const [sent, setSent] = useState<readonly SentEvent[]>([]);
  const [run, setRun] = useState(0);

  function handleEvent(event: DemoEvent) {
    setSent((events) => [...events, { ...event, id: events.length }]);
  }

  function reset() {
    setSent([]);
    setRun((value) => value + 1);
  }

  const last = sent.at(-1);

  return (
    <section aria-labelledby="demo" className="flex flex-col gap-4">
      <h2 id="demo" className="sr-only">
        Live demo
      </h2>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented
          legend="Sample"
          value={sample.id}
          options={samples.map((item) => ({ value: item.id, label: item.label }))}
          onChange={(value) => onChange({ sample: value })}
        />
        <Segmented
          legend="Theme"
          value={palette}
          options={palettes}
          onChange={(value) => onChange({ palette: value })}
        />
        <button
          type="button"
          onClick={reset}
          disabled={sent.length === 0}
          className="ml-auto rounded-md px-2.5 py-1 text-sm text-muted-foreground transition-[color,scale,opacity] duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.96] disabled:pointer-events-none disabled:opacity-0"
        >
          Reset demo
        </button>
      </div>
      <Thread key={run} sample={sample} palette={palette} sent={sent} onEvent={handleEvent} />
      {block.callback === null ? null : (
        <div className="flex flex-col gap-3 pt-6">
          <h3 className="text-sm font-medium">What comes back</h3>
          {last === undefined ? (
            <p className="text-sm text-pretty text-muted-foreground">
              Use the block above. The payload of{" "}
              <code translate="no" className="font-mono text-[13px]">
                {block.callback}
              </code>{" "}
              shows up here, and the app sends it to the agent as the next message.
            </p>
          ) : (
            <Code
              label={`${last.callback} payload`}
              code={`${last.callback}(${JSON.stringify(last.payload, null, 2)})`}
            />
          )}
        </div>
      )}
    </section>
  );
}

function SectionHeading({ id, title, children }: { id: string; title: string; children: string }) {
  return (
    <div className="flex max-w-2xl flex-col gap-1.5">
      <h2 id={id} className="text-lg font-semibold text-balance">
        {title}
      </h2>
      <p className="text-sm text-pretty text-muted-foreground">{children}</p>
    </div>
  );
}

function PagerLink({ block, direction }: { block: GalleryBlock; direction: "Previous" | "Next" }) {
  return (
    <Link
      to="/blocks/$name"
      params={{ name: block.name }}
      className={cn(
        "group flex flex-col gap-1 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        direction === "Next" ? "col-start-2 items-end text-right" : "items-start",
      )}
    >
      <span className="text-muted-foreground">{direction}</span>
      <span className="font-medium underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-150 group-hover:decoration-foreground">
        {block.title}
      </span>
    </Link>
  );
}
