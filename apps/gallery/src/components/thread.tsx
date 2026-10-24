import type { DemoEvent, DemoSample } from "~/blocks/types";

export const palettes = [
  { value: "neutral", label: "Neutral" },
  { value: "paper", label: "Paper" },
  { value: "harbor", label: "Harbor" },
] as const;

export type Palette = (typeof palettes)[number]["value"];

export type SentEvent = DemoEvent & { id: number };

type ThreadProps = {
  sample: DemoSample;
  palette: Palette;
  sent: readonly SentEvent[];
  onEvent: (event: DemoEvent) => void;
};

export function Thread({ sample, palette, sent, onEvent }: ThreadProps) {
  return (
    <div
      data-palette={palette}
      className="overflow-hidden rounded-2xl border bg-background text-foreground [font-family:var(--host-font)]"
    >
      <ol
        aria-label="Demo conversation"
        className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-3 py-6 sm:px-6 sm:py-8"
      >
        <UserMessage>{sample.prompt}</UserMessage>
        <li className="flex flex-col gap-3">
          <p className="text-sm text-pretty">{sample.lead}</p>
          {sample.render(onEvent)}
        </li>
        {sent.map((event) => (
          <UserMessage key={event.id}>{event.reply}</UserMessage>
        ))}
      </ol>
    </div>
  );
}

function UserMessage({ children }: { children: string }) {
  return (
    <li className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm text-pretty wrap-break-word">
        {children}
      </p>
    </li>
  );
}
