export function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ${String(seconds % 60).padStart(2, "0")}s`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
  }
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export function between(start: string, end: string | number) {
  return (typeof end === "number" ? end : Date.parse(end)) - Date.parse(start);
}
