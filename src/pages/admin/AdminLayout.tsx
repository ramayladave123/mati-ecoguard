import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Activity, Database, LayoutDashboard, LogOut, MapPin } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const links = [
  { to: "/admin", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/admin/sites", label: "Sites", icon: MapPin },
  { to: "/admin/ledger", label: "Ledger", icon: Database },
];

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate("/admin/auth", { replace: true }); }, [user, loading, navigate]);
  if (loading || !user) return null;

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-sidebar px-4 text-sidebar-foreground lg:h-screen lg:w-64 lg:flex-col lg:items-stretch lg:justify-start lg:border-b-0 lg:border-r lg:p-5">
        <Logo className="text-sidebar-foreground [&_span:last-child]:text-sidebar-primary" />
        <nav className="hidden flex-1 space-y-1 lg:mt-10 lg:block">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )
              }
            >
              <l.icon className="h-4 w-4" />{l.label}
            </NavLink>
          ))}
        </nav>
        <nav className="flex items-center gap-1 lg:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) =>
              cn("rounded-full px-3 py-1.5 text-xs font-medium",
                 isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block">
          <div className="rounded-xl bg-sidebar-accent/60 p-3 text-xs">
            <div className="opacity-70">Signed in as</div>
            <div className="truncate font-medium">{user.email}</div>
          </div>
          <Button variant="ghost" className="mt-3 w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden text-sidebar-foreground" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
