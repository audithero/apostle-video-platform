import { Link, useLocation } from "@tanstack/react-router";
import { Film, LayoutDashboard, MessageSquare, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Videos", to: "/admin/videos", icon: Video },
  { label: "Series", to: "/admin/series", icon: Film },
  { label: "Comments", to: "/admin/comments", icon: MessageSquare },
  { label: "Users", to: "/admin/users", icon: Users },
] as const;

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-muted/40 md:block">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="mb-4 px-2">
          <h2 className="text-lg font-semibold">Admin</h2>
        </div>
        <nav className="flex flex-col gap-1">
          {sidebarLinks.map((link) => {
            const isActive =
              link.to === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(link.to);

            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
