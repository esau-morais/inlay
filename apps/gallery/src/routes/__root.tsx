import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { LogoMark } from "~/components/logo";
import { ThemeToggle, themeScript } from "~/components/theme-toggle";
import { REPO_URL } from "~/site";
import appCss from "~/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Inlay" },
      {
        name: "description",
        content: "Open React blocks that agents show instead of chat text.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
    scripts: [{ children: themeScript }],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const navLink =
  "rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring";

function RootLayout() {
  return (
    <>
      <a
        href="#content"
        className="sr-only rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          to="/"
          className="-mx-1 flex items-center gap-2 rounded-md px-1 py-1 font-medium focus-visible:outline-2 focus-visible:outline-ring"
        >
          <LogoMark className="size-5" />
          Inlay
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className={navLink}
            activeProps={{ className: "text-foreground" }}
          >
            Blocks
          </Link>
          <Link to="/manifesto" className={navLink} activeProps={{ className: "text-foreground" }}>
            Manifesto
          </Link>
          <a href={REPO_URL} className={navLink}>
            GitHub
          </a>
          <ThemeToggle />
        </nav>
      </header>
      <div id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <Outlet />
      </div>
      <footer className="mx-auto mt-24 w-full max-w-5xl px-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t py-8 text-sm text-muted-foreground">
          <p>Inlay is MIT licensed and pre-release.</p>
          <a
            href={REPO_URL}
            className="underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground"
          >
            Source on GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
