#!/usr/bin/env bash
set -uo pipefail

port="${1:-4310}"
state="${TMPDIR:-/tmp}/verify-inlay-$port"
url="http://127.0.0.1:$port"
root="$(git rev-parse --show-toplevel)"
failed=0

check() {
	if eval "$2" >/dev/null 2>&1; then
		printf 'ok    %s\n' "$1"
	else
		printf 'FAIL  %s\n' "$1"
		failed=1
	fi
}

pid="$(cat "$state/pid" 2>/dev/null || true)"
check "launch.sh started a process (pid ${pid:-none})" "[ -n '$pid' ] && kill -0 '$pid'"
check "it was started from this worktree ($root)" "[ \"\$(cat '$state/root')\" = '$root' ]"
owner="$(ss -ltnpH "sport = :$port" 2>/dev/null | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)"
check "port $port belongs to that process group" "[ -n '$owner' ] && [ \"\$(ps -o pgid= -p '$owner' | tr -d ' ')\" = '$pid' ]"
check "index renders with its title" "curl -fsS '$url/' | grep -q '<title>Inlay: views agents show'"
check "every block page returns 200" "for b in approval-card agent-queue diff-review plan-compare data-chart; do curl -fsS -o /dev/null '$url/blocks/'\$b || exit 1; done"
check "manifesto returns 200" "curl -fsS -o /dev/null '$url/manifesto'"
check "unknown block returns 404" "[ \"\$(curl -s -o /dev/null -w '%{http_code}' '$url/blocks/nope')\" = 404 ]"

exit "$failed"
