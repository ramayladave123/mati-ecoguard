import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { beachImage } from "@/lib/beachImages";
import { capacityState } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface Beach {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  location: string | null;
  capacity: number;
  current_count: number;
  status: string;
  image_url: string | null;
}

export const BeachCard = ({ beach, index = 0 }: { beach: Beach; index?: number }) => {
  const { tone, label, pct } = capacityState(beach.current_count, beach.capacity);
  const halted = beach.status === "halted";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link
        to={`/checkin/${beach.slug}`}
        className="group relative block overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-glow"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={beachImage(beach.image_url)}
            alt={beach.name}
            loading="lazy"
            width={1280}
            height={896}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
          <div className="absolute left-3 top-3 flex gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md", {
              "bg-success/85 text-primary-foreground": tone === "success" && !halted,
              "bg-warning/90 text-accent-foreground": tone === "warning" && !halted,
              "bg-destructive/90 text-destructive-foreground": tone === "danger" || halted,
            })}>
              {halted ? "Halted" : label}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground">
            <h3 className="font-display text-xl font-bold drop-shadow">{beach.name}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs opacity-90">
              <MapPin className="h-3 w-3" />
              {beach.location}
            </div>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Live density</div>
              <div className="font-display text-2xl font-bold tabular-nums">
                {beach.current_count}
                <span className="text-sm font-normal text-muted-foreground"> / {beach.capacity}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2">
              Check in <ArrowRight className="h-4 w-4" />
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all duration-700", {
                "bg-success": tone === "success" && !halted,
                "bg-warning": tone === "warning" && !halted,
                "bg-destructive": tone === "danger" || halted,
              })}
              style={{ width: `${Math.min(pct * 100, 100)}%` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
