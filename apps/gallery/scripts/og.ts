import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const gallery = process.env.GALLERY_URL ?? "http://127.0.0.1:4310";
const browser = process.env.AGENT_BROWSER ?? "agent-browser";
const root = resolve(import.meta.dirname, "..");
const publicDir = join(root, "public");
const work = mkdtempSync(join(tmpdir(), "inlay-og-"));

const pages = [
  {
    file: "index",
    path: "/",
    title: "Views agents show instead of chat text",
    summary: "Open React blocks. The agent sends data, your app draws it in your theme.",
    url: "inlayui.dev",
  },
  {
    file: "approval-card",
    path: "/blocks/approval-card",
    title: "Approval card",
    summary: "A decision the agent needs, with options and a recommended one.",
    url: "inlayui.dev/blocks/approval-card",
  },
  {
    file: "agent-queue",
    path: "/blocks/agent-queue",
    title: "Agent queue",
    summary: "Jobs waiting, running and done, per worker.",
    url: "inlayui.dev/blocks/agent-queue",
  },
  {
    file: "diff-review",
    path: "/blocks/diff-review",
    title: "Diff review",
    summary: "Changed files grouped by importance, with notes.",
    url: "inlayui.dev/blocks/diff-review",
  },
  {
    file: "plan-compare",
    path: "/blocks/plan-compare",
    title: "Plan compare",
    summary: "Two to four options side by side, to pick one.",
    url: "inlayui.dev/blocks/plan-compare",
  },
  {
    file: "data-chart",
    path: "/blocks/data-chart",
    title: "Data chart",
    summary: "A line, bar or treemap chart from rows.",
    url: "inlayui.dev/blocks/data-chart",
  },
];

function run(...args: string[]) {
  execFileSync(browser, args, { stdio: ["ignore", "ignore", "inherit"] });
}

function font(pkg: string, file: string) {
  return pathToFileURL(join(root, "node_modules/@fontsource-variable", pkg, "files", file)).href;
}

function escape(text: string) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function card(page: (typeof pages)[number], shot: string) {
  const image = `data:image/png;base64,${readFileSync(shot).toString("base64")}`;
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: Geist; src: url(${font("geist", "geist-latin-wght-normal.woff2")}); font-weight: 100 900; }
@font-face { font-family: Geist Mono; src: url(${font("geist-mono", "geist-mono-latin-wght-normal.woff2")}); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #fafafa; color: #0a0a0a; font-family: Geist; display: flex; }
.copy { width: 520px; padding: 64px 0 56px 72px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 12px; font-size: 26px; font-weight: 500; }
h1 { margin-top: auto; font-size: 60px; line-height: 1.05; font-weight: 600; text-wrap: balance; }
p { margin-top: 20px; font-size: 26px; line-height: 1.35; color: #666; text-wrap: pretty; }
.url { margin-top: 40px; font-family: Geist Mono; font-size: 20px; color: #888; }
.shot { flex: 1; position: relative; overflow: hidden; }
.shot img { position: absolute; left: 56px; top: 64px; width: 600px; border-radius: 14px; box-shadow: 0 1px 2px rgb(0 0 0 / 0.06), 0 12px 40px rgb(0 0 0 / 0.08); }
</style></head><body>
<div class="copy">
  <div class="brand"><svg width="30" height="30" viewBox="0 0 20 20" fill="none"><rect x="1.75" y="1.75" width="16.5" height="16.5" rx="4.25" stroke="currentColor" stroke-width="1.5"/><rect x="5.5" y="9.5" width="9" height="5" rx="1.25" fill="currentColor"/></svg>Inlay</div>
  <h1>${escape(page.title)}</h1>
  <p>${escape(page.summary)}</p>
  <div class="url">${escape(page.url)}</div>
</div>
<div class="shot"><img src="${image}" alt=""></div>
</body></html>`;
}

run("set", "media", "light");
for (const page of pages) {
  const shot = join(work, `${page.file}-block.png`);
  run("set", "viewport", "1100", "1600");
  run("open", `${gallery}${page.path}`);
  run("wait", "600");
  run("screenshot", "[data-palette] ol > li:nth-child(2) > :last-child", shot);
  const html = join(work, `${page.file}.html`);
  writeFileSync(html, card(page, shot));
  run("set", "viewport", "1200", "630");
  run("open", pathToFileURL(html).href);
  run("wait", "300");
  run("screenshot", join(publicDir, "og", `${page.file}.png`));
}

const iconHtml = join(work, "icon.html");
writeFileSync(
  iconHtml,
  `<!doctype html><html><body style="margin:0;width:180px;height:180px;background:#0a0a0a;display:flex;align-items:center;justify-content:center"><svg width="112" height="112" viewBox="0 0 20 20" fill="none"><rect x="1.75" y="1.75" width="16.5" height="16.5" rx="4.25" stroke="#fafafa" stroke-width="1.5"/><rect x="5.5" y="9.5" width="9" height="5" rx="1.25" fill="#fafafa"/></svg></body></html>`,
);
run("set", "viewport", "180", "180");
run("open", pathToFileURL(iconHtml).href);
run("screenshot", join(publicDir, "apple-touch-icon.png"));
execFileSync("ffmpeg", [
  "-y",
  "-loglevel",
  "error",
  "-i",
  join(publicDir, "apple-touch-icon.png"),
  "-vf",
  "scale=32:32:flags=lanczos",
  join(publicDir, "favicon.ico"),
]);
console.log(`Wrote OG images and icons to ${publicDir}`);
