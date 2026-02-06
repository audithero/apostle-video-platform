import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { isAdmin } from "@/lib/auth/permissions";
import { RouteErrorBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/_authed/admin")({
  beforeLoad: async ({ context }) => {
    const session = context.session;
    if (!session?.user || !isAdmin(session.user.role as string | undefined)) {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
  errorComponent: RouteErrorBoundary,
});

function AdminLayout() {
  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
