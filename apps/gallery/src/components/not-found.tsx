import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start gap-4 px-5 py-24 sm:px-8">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold text-balance">This page does not exist.</h1>
      <Link
        to="/"
        className="text-sm font-medium underline decoration-border underline-offset-4 hover:decoration-foreground"
      >
        See all blocks
      </Link>
    </main>
  );
}
