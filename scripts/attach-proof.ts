import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { parseArgs } from "node:util";

const BRANCH = "proof-assets";
const START = "<!-- proof:start -->";
const END = "<!-- proof:end -->";
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".webm", ".mp4"]);

type Asset =
  | { kind: "image"; source: string; name: string }
  | { kind: "video"; source: string; name: string; preview: string | null };

type Uploaded = { asset: Asset; url: string; previewUrl: string | null };

type Section = { title: string | null; files: string[] };

const FLAT_LIMIT = 6;

const usage = `Usage: node scripts/attach-proof.ts [--pr <number>] [--note <text>] [--section <title>] <file>... [--section <title> <file>...]

Uploads screenshots and recordings to the ${BRANCH} branch and writes them
into the Proof section of the pull request body. Each run replaces the
section, so pass every file the PR needs in one call.

Files after --section <title> belong to that section. With sections, or with
more than ${FLAT_LIMIT} files, each section renders as a collapsed disclosure.`;

function run(command: string, args: readonly string[], env?: NodeJS.ProcessEnv): string {
  return execFileSync(command, args, {
    encoding: "utf8",
    env: env ?? process.env,
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
}

function hasFfmpeg(): boolean {
  return spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
}

function makeGif(video: string, workDir: string): string {
  const out = join(workDir, `${basename(video, extname(video))}.gif`);
  run("ffmpeg", [
    "-loglevel",
    "error",
    "-y",
    "-i",
    video,
    "-vf",
    "fps=10,scale='min(960,iw)':-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse",
    "-loop",
    "0",
    out,
  ]);
  return out;
}

function toAsset(file: string, workDir: string, canPreview: boolean): Asset {
  if (!existsSync(file)) {
    throw new Error(`${file} does not exist`);
  }
  const ext = extname(file).toLowerCase();
  const name = basename(file, ext);
  if (IMAGE_EXTENSIONS.has(ext)) {
    return { kind: "image", source: file, name };
  }
  if (VIDEO_EXTENSIONS.has(ext)) {
    return {
      kind: "video",
      source: file,
      name,
      preview: canPreview ? makeGif(file, workDir) : null,
    };
  }
  throw new Error(
    `${file} is not an image or a recording (${[...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS].join(", ")})`,
  );
}

function remoteHead(): string | null {
  const line = run("git", ["ls-remote", "origin", `refs/heads/${BRANCH}`]);
  const sha = line.split("\t")[0];
  if (sha === undefined || sha === "") {
    return null;
  }
  run("git", ["fetch", "--quiet", "origin", `refs/heads/${BRANCH}`]);
  return sha;
}

function commitAssets(
  pr: number,
  files: ReadonlyMap<string, string>,
  workDir: string,
): { commit: string; paths: Map<string, string> } {
  const parent = remoteHead();
  const env = { ...process.env, GIT_INDEX_FILE: join(workDir, "index") };
  run("git", parent === null ? ["read-tree", "--empty"] : ["read-tree", parent], env);

  const stamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  const paths = new Map<string, string>();
  for (const [source, fileName] of files) {
    const path = `pr-${pr}/${stamp}/${fileName}`;
    const blob = run("git", ["hash-object", "-w", source]);
    run("git", ["update-index", "--add", "--cacheinfo", `100644,${blob},${path}`], env);
    paths.set(source, path);
  }

  const tree = run("git", ["write-tree"], env);
  const parentArgs = parent === null ? [] : ["-p", parent];
  const commit = run("git", [
    "commit-tree",
    tree,
    ...parentArgs,
    "-m",
    `chore(proof): add evidence for #${pr}`,
  ]);
  return { commit, paths };
}

function pushAssets(
  pr: number,
  files: ReadonlyMap<string, string>,
): { commit: string; paths: Map<string, string> } {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const workDir = mkdtempSync(join(tmpdir(), "inlay-proof-index-"));
    try {
      const result = commitAssets(pr, files, workDir);
      const push = spawnSync(
        "git",
        ["push", "--quiet", "origin", `${result.commit}:refs/heads/${BRANCH}`],
        {
          stdio: ["ignore", "inherit", "inherit"],
        },
      );
      if (push.status === 0) {
        return result;
      }
    } finally {
      rmSync(workDir, { recursive: true, force: true });
    }
  }
  throw new Error(`could not push to ${BRANCH} after 3 attempts`);
}

function renderAsset({ asset, url, previewUrl }: Uploaded): string[] {
  if (asset.kind === "image") {
    return [`**${asset.name}**`, "", `![${asset.name}](${url})`, ""];
  }
  const preview = previewUrl === null ? [] : [`![${asset.name}](${previewUrl})`, ""];
  return [`**${asset.name}** ([recording](${url}))`, "", ...preview];
}

function renderSection(
  groups: readonly { title: string | null; uploads: readonly Uploaded[] }[],
  note: string | undefined,
): string {
  const lines = [START, "## Proof", ""];
  if (note !== undefined && note !== "") {
    lines.push(note, "");
  }
  const total = groups.reduce((sum, group) => sum + group.uploads.length, 0);
  const collapse = groups.some((group) => group.title !== null) || total > FLAT_LIMIT;
  for (const { title, uploads } of groups) {
    if (!collapse) {
      lines.push(...uploads.flatMap(renderAsset));
      continue;
    }
    const count = `${uploads.length} ${uploads.length === 1 ? "file" : "files"}`;
    lines.push(
      "<details>",
      `<summary><b>${title ?? "Captures"}</b> (${count})</summary>`,
      "",
      ...uploads.flatMap(renderAsset),
      "</details>",
      "",
    );
  }
  lines.push("<sub>Uploaded with `scripts/attach-proof.ts`.</sub>", END);
  return lines.join("\n");
}

function replaceSection(body: string, section: string): string {
  const start = body.indexOf(START);
  const end = body.indexOf(END);
  if (start !== -1 && end > start) {
    return `${body.slice(0, start)}${section}${body.slice(end + END.length)}`;
  }
  return `${body.trimEnd()}\n\n${section}\n`;
}

function main(): void {
  const { values, positionals, tokens } = parseArgs({
    allowPositionals: true,
    tokens: true,
    options: {
      pr: { type: "string" },
      note: { type: "string" },
      section: { type: "string", multiple: true },
      help: { type: "boolean", short: "h" },
    },
  });
  const sections: Section[] = [{ title: null, files: [] }];
  for (const token of tokens) {
    if (token.kind === "option" && token.name === "section") {
      sections.push({ title: token.value ?? null, files: [] });
    } else if (token.kind === "positional") {
      sections.at(-1)?.files.push(token.value);
    }
  }
  if (values.help === true || positionals.length === 0) {
    console.info(usage);
    process.exit(values.help === true ? 0 : 1);
  }

  const pr = Number(values.pr ?? run("gh", ["pr", "view", "--json", "number", "--jq", ".number"]));
  if (!Number.isInteger(pr) || pr <= 0) {
    throw new Error(`--pr must be a pull request number, got ${values.pr ?? "nothing"}`);
  }
  const repo = run("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);

  const workDir = mkdtempSync(join(tmpdir(), "inlay-proof-"));
  try {
    const canPreview = hasFfmpeg();
    const assets = positionals.map((file) => toAsset(file, workDir, canPreview));
    const files = new Map<string, string>();
    for (const asset of assets) {
      files.set(asset.source, basename(asset.source));
      if (asset.kind === "video" && asset.preview !== null) {
        files.set(asset.preview, `${asset.name}.preview.gif`);
      }
    }

    const { commit, paths } = pushAssets(pr, files);
    const urlFor = (source: string): string => {
      const path = paths.get(source);
      if (path === undefined) {
        throw new Error(`no uploaded path for ${source}`);
      }
      return `https://raw.githubusercontent.com/${repo}/${commit}/${path}`;
    };
    const uploads = new Map(
      assets.map((asset): [string, Uploaded] => [
        asset.source,
        {
          asset,
          url: urlFor(asset.source),
          previewUrl:
            asset.kind === "video" && asset.preview !== null ? urlFor(asset.preview) : null,
        },
      ]),
    );
    const groups = sections
      .filter((section) => section.files.length > 0)
      .map((section) => ({
        title: section.title,
        uploads: section.files.flatMap((file) => uploads.get(file) ?? []),
      }));

    const body = run("gh", ["pr", "view", String(pr), "--json", "body", "--jq", ".body"]);
    const bodyFile = join(workDir, "body.md");
    writeFileSync(bodyFile, replaceSection(body, renderSection(groups, values.note)));
    run("gh", ["pr", "edit", String(pr), "--body-file", bodyFile]);

    if (!canPreview && assets.some((asset) => asset.kind === "video")) {
      console.warn("ffmpeg is not installed, so recordings are linked without an inline preview.");
    }
    console.info(
      `Attached ${assets.length} file(s) to ${repo}#${pr} from ${BRANCH}@${commit.slice(0, 7)}.`,
    );
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

main();
