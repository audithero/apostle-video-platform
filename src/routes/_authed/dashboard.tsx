import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Mail,
  Layout,
  BarChart3,
  Settings,
  CreditCard,
  Gauge,
  GraduationCap,
  MessageSquare,
  Sparkles,
  UserPlus,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RouteErrorBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardLayout,
  errorComponent: RouteErrorBoundary,
});

interface NavItem {
  readonly label: string;
  readonly to: string;
  readonly icon: typeof LayoutDashboard;
}

const primaryNavItems: ReadonlyArray<NavItem> = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", to: "/dashboard/courses", icon: BookOpen },
  { label: "Students", to: "/dashboard/students", icon: GraduationCap },
  { label: "Community", to: "/dashboard/community", icon: MessageSquare },
  { label: "Email", to: "/dashboard/emails", icon: Mail },
  { label: "Pages", to: "/dashboard/pages", icon: Layout },
  { label: "Avatar Packs", to: "/dashboard/avatar-packs", icon: Sparkles },
  { label: "Affiliates", to: "/dashboard/affiliates", icon: UserPlus },
];

const secondaryNavItems: ReadonlyArray<NavItem> = [
  { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
  { label: "Usage", to: "/dashboard/usage", icon: Gauge },
  { label: "Pricing", to: "/dashboard/pricing", icon: CreditCard },
  { label: "Webhooks", to: "/dashboard/settings/webhooks", icon: Webhook },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
];

function SidebarNavLink({ item }: { readonly item: NavItem }) {
  const location = useLocation();
  const isActive =
    item.to === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(item.to);

  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <Icon className="size-4" />
      {item.label}
    </Link>
  );
}

function DashboardSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-muted/40 md:block">
      <ScrollArea className="h-full">
        <div className="flex h-full flex-col p-4">
          <div className="mb-4 px-2">
            <h2 className="text-lg font-semibold tracking-tight">Dashboard</h2>
            <p className="text-xs text-muted-foreground">
              Manage your courses and content
            </p>
          </div>

          <nav className="flex flex-col gap-1" aria-label="Dashboard navigation">
            {primaryNavItems.map((item) => (
              <SidebarNavLink key={item.to} item={item} />
            ))}
          </nav>

          <Separator className="my-4" />

          <nav className="flex flex-col gap-1" aria-label="Dashboard settings navigation">
            {secondaryNavItems.map((item) => (
              <SidebarNavLink key={item.to} item={item} />
            ))}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  );
}

function DashboardLayout() {
  return (
    <div className="flex flex-1">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
