#!/usr/bin/env bash
# Start the Inlay gallery dev server in its own process group and wait until it renders.
# Usage: launch.sh [port]
set -euo pipefail

port="${1:-4310}"
root="$(git rev-parse --show-toplevel)"
state="${TMPDIR:-/tmp}/verify-inlay-$port"
url="http://127.0.0.1:$port"
mkdir -p "$state"

if [ -f "$state/pid" ] && kill -0 "$(cat "$state/pid")" 2>/dev/null; then
	printf 'already running: %s (pid %s, log %s)\n' "$url" "$(cat "$state/pid")" "$state/log"
	exit 0
fi

if [ ! -d "$root/apps/gallery/node_modules" ]; then
	(cd "$root" && pnpm install --frozen-lockfile)
fi

cd "$root/apps/gallery"
setsid pnpm exec vite dev --host 127.0.0.1 --port "$port" --strictPort >"$state/log" 2>&1 &
printf '%s\n' "$!" >"$state/pid"
printf '%s\n' "$root" >"$state/root"

for _ in $(seq 1 60); do
	if curl -fsS "$url/blocks/approval-card" 2>/dev/null | grep -q '<title>Approval card'; then
		printf 'ready: %s (pid %s, log %s)\n' "$url" "$(cat "$state/pid")" "$state/log"
		exit 0
	fi
	if ! kill -0 "$(cat "$state/pid")" 2>/dev/null; then
		printf 'dev server exited before it was ready:\n' >&2
		cat "$state/log" >&2
		rm -f "$state/pid"
		exit 1
	fi
	sleep 1
done

printf 'timed out after 60s waiting for %s; log: %s\n' "$url" "$state/log" >&2
exit 1
