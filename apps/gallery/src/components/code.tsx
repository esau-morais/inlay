import { cn } from "@inlay/blocks/lib/utils.ts";
import { useState } from "react";

type CodeProps = {
  code: string;
  label: string;
  capped?: boolean;
};

export function Code({ code, label, capped = true }: CodeProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-muted/40">
      <section
        aria-label={label}
        tabIndex={0}
        className={cn(
          "overflow-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          capped && "max-h-[28rem]",
        )}
      >
        <pre
          translate="no"
          className="w-max min-w-full p-4 pr-20 font-mono text-[13px] leading-relaxed"
        >
          <code>{code}</code>
        </pre>
      </section>
      <CopyButton text={code} label={label} />
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void copy()}
        className="absolute top-2.5 right-2.5 rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-[color,scale] duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.96]"
      >
        {copied ? "Copied" : "Copy"}
        <span className="sr-only"> {label}</span>
      </button>
      <output className="sr-only">{copied ? `Copied ${label}` : null}</output>
    </>
  );
}
