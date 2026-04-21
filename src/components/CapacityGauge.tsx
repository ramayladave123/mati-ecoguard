import { motion } from "framer-motion";
import { capacityState } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  count: number;
  capacity: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

export const CapacityGauge = ({ count, capacity, size = 140, showLabel = true, className }: Props) => {
  const { tone, label, pct } = capacityState(count, capacity);
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(pct, 1);

  const toneClasses = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  }[tone];

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          className={toneClasses}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-3xl font-bold tabular-nums">{count}</div>
        <div className="text-xs text-muted-foreground">of {capacity}</div>
      </div>
      {showLabel && (
        <div className={cn("mt-3 rounded-full px-3 py-1 text-xs font-semibold", {
          "bg-success/15 text-success": tone === "success",
          "bg-warning/15 text-warning": tone === "warning",
          "bg-destructive/15 text-destructive": tone === "danger",
        })}>
          {label}
        </div>
      )}
    </div>
  );
};
