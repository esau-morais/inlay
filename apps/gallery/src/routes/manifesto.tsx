import { Link, createFileRoute } from "@tanstack/react-router";

import { pageHead } from "~/site";

export const Route = createFileRoute("/manifesto")({
  head: () =>
    pageHead({
      title: "Chat is where you start · Inlay",
      description:
        "Chat is good at one thing: you say what you want. Agents should send data, not markup, and apps should draw it with parts they own.",
      path: "/manifesto",
    }),
  component: Manifesto,
});

function Manifesto() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-5 pt-12 sm:px-8 sm:pt-20">
      <article className="flex max-w-[34rem] flex-col gap-6 font-serif text-xl leading-relaxed text-pretty sm:text-[1.375rem]">
        <p className="font-sans text-sm text-muted-foreground">Manifesto</p>
        <h1 className="text-4xl leading-tight font-medium text-balance sm:text-5xl">
          Chat is where you start
        </h1>
        <p>Chat is good at one thing. You say what you want.</p>
        <p>
          It is bad at most of what comes after. A plan with four options turns into a wall of text.
          A diff turns into a list of file names. The one question that needs your yes sits in
          paragraph six.
        </p>
        <p>
          People fix this one app at a time. T3 Code renders HTML. ChatGPT draws its own screens.
          Seven forks copied the same tool in a month. Every team builds the same approval card,
          alone.
        </p>
        <p>
          The fix is small. Agents should send data, not markup. Apps should draw that data with
          parts they own. Those parts should be open, so anyone can copy them, change them and ship
          them.
        </p>
        <p>
          Inlay is a set of those parts. One block for each job an agent does. Approve a step.
          Compare plans. Review a diff. Watch the queue.
        </p>
        <p>Chat stays. You still start there. But the answer should look like the work.</p>
        <p className="mt-6 font-sans text-sm">
          <Link
            to="/"
            className="font-medium underline decoration-border underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-foreground"
          >
            See the blocks
          </Link>
        </p>
      </article>
    </main>
  );
}
