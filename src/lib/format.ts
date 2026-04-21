export const shortHash = (h: string, head = 6, tail = 4) =>
  h.length > head + tail + 2 ? `${h.slice(0, head)}…${h.slice(-tail)}` : h;

export const capacityState = (count: number, capacity: number) => {
  const pct = capacity > 0 ? count / capacity : 0;
  if (pct >= 0.9) return { tone: "danger" as const, label: "At Capacity", pct };
  if (pct >= 0.7) return { tone: "warning" as const, label: "Filling Up", pct };
  return { tone: "success" as const, label: "Open", pct };
};

export const formatRelative = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
