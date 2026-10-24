#!/usr/bin/env bash
# Stop the gallery that launch.sh started on <port>. Leaves .proof/ untouched.
# Usage: stop.sh [port]
set -euo pipefail

port="${1:-4310}"
state="${TMPDIR:-/tmp}/verify-inlay-$port"

if [ -f "$state/pid" ]; then
	pid="$(cat "$state/pid")"
	kill -- "-$pid" 2>/dev/null || true
	for _ in $(seq 1 10); do
		kill -0 "$pid" 2>/dev/null || break
		sleep 0.5
	done
	kill -9 -- "-$pid" 2>/dev/null || true
	printf 'stopped pid group %s\n' "$pid"
else
	printf 'nothing started by launch.sh on port %s\n' "$port"
fi
rm -rf "$state"
