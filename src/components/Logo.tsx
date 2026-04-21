import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="EcoLog-Mati home">
    <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-ocean shadow-glow transition-transform group-hover:scale-105">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
        <path d="M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
        <circle cx="12" cy="7" r="3" />
      </svg>
    </span>
    <span className="font-display text-lg font-bold tracking-tight">
      EcoLog<span className="text-primary">-Mati</span>
    </span>
  </Link>
);
