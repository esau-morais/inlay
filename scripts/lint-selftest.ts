import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const expected: Record<string, readonly string[]> = {
  "tests/lint/fixtures/types.ts": [
    "typescript(no-explicit-any)",
    "typescript(no-non-null-assertion)",
    "typescript(switch-exhaustiveness-check)",
    "typescript(no-floating-promises)",
  ],
  "tests/lint/fixtures/react.tsx": [
    "react-hooks(rules-of-hooks)",
    "react-hooks(exhaustive-deps)",
    "react(set-state-in-effect)",
    "react(no-array-index-key)",
    "react(button-has-type)",
    "jsx-a11y(alt-text)",
    "jsx-a11y(click-events-have-key-events)",
  ],
};

type Diagnostic = { filename: string; code: string };

function isDiagnostic(value: unknown): value is Diagnostic {
  return (
    typeof value === "object" &&
    value !== null &&
    "filename" in value &&
    typeof value.filename === "string" &&
    "code" in value &&
    typeof value.code === "string"
  );
}

function readDiagnostics(stdout: string): Diagnostic[] {
  const report: unknown = JSON.parse(stdout);
  if (typeof report !== "object" || report === null || !("diagnostics" in report)) {
    throw new Error(`oxlint printed no diagnostics array:\n${stdout}`);
  }
  const { diagnostics } = report;
  if (!Array.isArray(diagnostics)) {
    throw new Error("oxlint diagnostics is not an array");
  }
  return diagnostics.filter(isDiagnostic);
}

const config: unknown = JSON.parse(readFileSync(".oxlintrc.json", "utf8"));
if (typeof config !== "object" || config === null) {
  throw new Error(".oxlintrc.json is not an object");
}
const fixtureConfig = Object.fromEntries(
  Object.entries(config).filter(([key]) => key !== "ignorePatterns" && key !== "$schema"),
);

const cacheDir = join("node_modules", ".cache", "inlay");
mkdirSync(cacheDir, { recursive: true });
const fixtureConfigPath = join(cacheDir, "oxlintrc.selftest.json");
writeFileSync(fixtureConfigPath, JSON.stringify(fixtureConfig));

const result = spawnSync(
  "pnpm",
  ["exec", "oxlint", "-c", fixtureConfigPath, "-f", "json", ...Object.keys(expected)],
  { encoding: "utf8" },
);
if (result.error) {
  throw result.error;
}

const seen = new Set(readDiagnostics(result.stdout).map((d) => `${d.filename} ${d.code}`));
const missing = Object.entries(expected).flatMap(([file, codes]) =>
  codes.filter((code) => !seen.has(`${file} ${code}`)).map((code) => `${file} ${code}`),
);

if (missing.length > 0) {
  console.error("These lint rules no longer fire on their fixtures:");
  for (const line of missing) {
    console.error(`  ${line}`);
  }
  process.exit(1);
}

const total = Object.values(expected).reduce((sum, codes) => sum + codes.length, 0);
console.info(`lint self-test passed: ${total} rules fire on their fixtures`);
