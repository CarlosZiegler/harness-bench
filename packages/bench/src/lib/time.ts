export function nowIso() {
  return new Date().toISOString();
}

export function elapsedSeconds(startIso: string, endIso = nowIso()) {
  return Math.max(0, (Date.parse(endIso) - Date.parse(startIso)) / 1000);
}

export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds)) return "—";
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r}s`;
  const h = Math.floor(m / 60);
  if (h === 0) return `${m}m${String(r).padStart(2, "0")}s`;
  return `${h}h${String(m % 60).padStart(2, "0")}m`;
}
