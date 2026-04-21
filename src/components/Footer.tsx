import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="relative mt-24 overflow-hidden bg-foreground text-background">
    <div className="wave-divider absolute inset-x-0 -top-[1px] h-20 [filter:invert(1)] opacity-90" />
    <div className="container relative z-10 grid gap-8 py-16 md:grid-cols-3">
      <div className="space-y-3">
        <Logo className="text-background [&_span:last-child]:text-background" />
        <p className="max-w-xs text-sm opacity-70">
          Autonomous blockchain-based tourism density & environmental monitoring for Mati City, Davao Oriental.
        </p>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest opacity-60">For Tourists</div>
        <ul className="mt-3 space-y-2 text-sm">
          <li><a className="opacity-80 hover:opacity-100" href="/">Browse sites</a></li>
          <li><a className="opacity-80 hover:opacity-100" href="/checkin">QR Check-in</a></li>
        </ul>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest opacity-60">For LGU & CTO</div>
        <ul className="mt-3 space-y-2 text-sm">
          <li><a className="opacity-80 hover:opacity-100" href="/admin">Admin dashboard</a></li>
          <li><a className="opacity-80 hover:opacity-100" href="/admin/ledger">Tamper-proof ledger</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-background/10 py-5">
      <div className="container flex flex-col items-center justify-between gap-2 text-xs opacity-60 md:flex-row">
        <span>© {new Date().getFullYear()} EcoLog-Mati · City Tourism Office, Mati City</span>
        <span>Powered by tamper-evident ledger · 0.8g CO₂e / tx</span>
      </div>
    </div>
  </footer>
);
