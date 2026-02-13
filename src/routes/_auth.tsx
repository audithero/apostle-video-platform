import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1">
        {/* Decorative side panel - desktop only */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] items-center justify-center bg-gaspar-cream relative overflow-hidden">
          <div className="relative z-10 max-w-md px-12 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gaspar-navy" style={{ fontFamily: "var(--font-heading)" }}>
              Build your
              <br />
              learning empire.
            </h2>
            <p className="mt-4 text-lg text-gaspar-navy/70">
              Create, launch, and grow online courses with the tools creators love.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-gaspar-purple" />
              <span className="inline-block h-2 w-2 rounded-full bg-gaspar-lavender" />
              <span className="inline-block h-2 w-2 rounded-full bg-gaspar-pink" />
            </div>
          </div>
          {/* Subtle decorative shapes */}
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gaspar-peach/40" />
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gaspar-blue/30" />
          <div className="absolute bottom-24 right-12 h-32 w-32 rounded-full bg-gaspar-pink/30" />
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
