import { Link, useRouterState } from "@tanstack/react-router";
import { FilePlus, FileText, Settings, Stamp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppPath = "/" | "/new" | "/notes" | "/employees" | "/settings";

const SIDEBAR: { to: AppPath; label: string; icon: LucideIcon; match: "exact" | "prefix" }[] = [
  { to: "/", label: "Desk", icon: Stamp, match: "exact" },
  { to: "/new", label: "New note", icon: FilePlus, match: "exact" },
  { to: "/notes", label: "Notes", icon: FileText, match: "prefix" },
  { to: "/employees", label: "Employees", icon: Users, match: "prefix" },
  { to: "/settings", label: "Letterhead", icon: Settings, match: "prefix" },
];

const MOBILE: { to: AppPath; label: string; icon: LucideIcon; match: "exact" | "prefix" }[] = [
  { to: "/", label: "Desk", icon: Stamp, match: "exact" },
  { to: "/new", label: "New", icon: FilePlus, match: "exact" },
  { to: "/employees", label: "People", icon: Users, match: "prefix" },
  { to: "/settings", label: "Clinic", icon: Settings, match: "prefix" },
];

function active(pathname: string, to: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavLink({
  to,
  label,
  icon: Icon,
  match,
  layout,
}: {
  to: AppPath;
  label: string;
  icon: LucideIcon;
  match: "exact" | "prefix";
  layout: "side" | "tab";
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const on = active(pathname, to, match);
  if (layout === "tab") {
    return (
      <Link
        to={to}
        className={cn(
          "flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
          on ? "text-sidebar-foreground" : "text-sidebar-muted",
        )}
      >
        <Icon className="size-5" />
        {label}
      </Link>
    );
  }
  return (
    <Link
      to={to}
      className={cn(
        "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
        on
          ? "bg-sidebar-hover text-sidebar-foreground"
          : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export function AppShell({
  children,
  title,
  action,
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="px-5 pt-8 pb-6">
          <Link to="/" className="block">
            <div className="font-display text-2xl font-medium tracking-tight">
              DutyDesk
            </div>
            <div className="mt-1 text-xs tracking-wide text-sidebar-muted">
              Work-status notes
            </div>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {SIDEBAR.map((item) => (
            <NavLink key={item.to} {...item} layout="side" />
          ))}
        </nav>
        <div className="px-5 py-6 text-xs text-sidebar-muted">
          Stays on this device
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm lg:h-16 lg:px-8">
          <div className="min-w-0">
            <div className="font-display text-lg font-medium tracking-tight lg:hidden">
              DutyDesk
            </div>
            {title ? (
              <div className="hidden truncate text-sm text-muted-foreground lg:block">
                {title}
              </div>
            ) : null}
          </div>
          {action}
        </header>
        <main className="px-4 pt-5 pb-28 lg:px-8 lg:pt-8 lg:pb-12">{children}</main>
      </div>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-sidebar text-sidebar-foreground lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 px-1 pb-[env(safe-area-inset-bottom)]">
          {MOBILE.map((item) => (
            <NavLink key={item.to} {...item} layout="tab" />
          ))}
        </div>
      </nav>
    </div>
  );
}
