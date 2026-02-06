import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RouteErrorBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
  errorComponent: RouteErrorBoundary,
});

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
