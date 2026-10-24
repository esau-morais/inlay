type Status = { kind: "queued" } | { kind: "running" } | { kind: "done" };

export function label(status: Status): string {
  switch (status.kind) {
    case "queued":
      return "Queued";
    case "running":
      return "Running";
  }
  return "";
}

export function parse(raw: string): any {
  return JSON.parse(raw);
}

export function first(items: string[] | undefined): string {
  return items![0] ?? "";
}

async function save(): Promise<void> {}

export function submit(): void {
  save();
}
