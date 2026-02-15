import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Mail,
  Layout,
  LayoutTemplate,
  Rocket,
  BarChart3,
  Settings,
  CreditCard,
  Gauge,
  GraduationCap,
  MessageSquare,
  Sparkles,
  UserPlus,
  Webhook,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { RouteErrorBoundary } from "@/components/error-boundary";
import { isCreator } from "@/lib/auth/permissions";

export const Route = createFileRoute("/_authed/dashboard")({
  beforeLoad: async ({ context }) => {
    const session = context.session;
    if (!session?.user || !isCreator(session.user.role as string | undefined)) {
      throw redirect({ to: "/onboarding" });
    }
  },
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
  { label: "Templates", to: "/dashboard/templates", icon: LayoutTemplate },
  { label: "Deployments", to: "/dashboard/deployments", icon: Rocket },
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

const allNavItems = [...primaryNavItems, ...secondaryNavItems];

function SidebarNavLink({
  item,
  onNavigate,
}: {
  readonly item: NavItem;
  readonly onNavigate?: () => void;
}) {
  const location = useLocation();
  const isActive =
    item.to === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(item.to) &&
        !allNavItems.some(
          (other) =>
            other.to !== item.to &&
            other.to.length > item.to.length &&
            location.pathname.startsWith(other.to),
        );

  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      {item.label}
    </Link>
  );
}

function SidebarNav({ onNavigate }: { readonly onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col px-3 py-6">
      <div className="mb-6 px-3">
        <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Dashboard
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Manage your courses and content
        </p>
      </div>

      <nav className="flex flex-col gap-0.5" aria-label="Dashboard navigation">
        {primaryNavItems.map((item) => (
          <SidebarNavLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mx-3 my-4 h-px bg-border/60" />

      <nav className="flex flex-col gap-0.5" aria-label="Dashboard settings navigation">
        {secondaryNavItems.map((item) => (
          <SidebarNavLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  );
}

function DashboardSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/50 bg-card/50 md:block">
      <ScrollArea className="h-full">
        <SidebarNav />
      </ScrollArea>
    </aside>
  );
}

function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <ScrollArea className="h-full">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function DashboardLayout() {
  return (
    <div className="flex flex-1">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 flex items-center border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-sm md:hidden">
          <MobileSidebarTrigger />
          <span className="ml-3 text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            Dashboard
          </span>
        </div>
        <div className="container py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
