import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ScanLine, Waves } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/" label="Sites" icon={<Waves className="h-4 w-4" />} active={pathname === "/"} />
          <NavItem to="/checkin" label="Check-In" icon={<ScanLine className="h-4 w-4" />} active={pathname.startsWith("/checkin")} />
          <NavItem to="/admin" label="Admin" icon={<LayoutDashboard className="h-4 w-4" />} active={isAdmin} />
        </nav>
        <Button asChild variant="hero" size="sm" className="hidden md:inline-flex">
          <Link to="/checkin"><ScanLine className="mr-1.5 h-4 w-4" />Scan QR</Link>
        </Button>
        <Button asChild variant="hero" size="sm" className="md:hidden">
          <Link to="/checkin"><ScanLine className="h-4 w-4" /></Link>
        </Button>
      </div>
    </header>
  );
};

const NavItem = ({ to, label, icon, active }: { to: string; label: string; icon: React.ReactNode; active?: boolean }) => (
  <Link
    to={to}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    {icon}{label}
  </Link>
);
