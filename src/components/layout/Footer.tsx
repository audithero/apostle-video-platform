import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="container py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <span className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-[0.25em] uppercase">
              Apostle
            </span>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Premium culinary experiences. Stream exclusive cooking shows and
              masterclasses from world-class chefs.
            </p>
          </div>

          {/* Spacer on desktop */}
          <div className="hidden md:col-span-3 md:block" />

          {/* Navigation */}
          <div className="md:col-span-2">
            <h3 className="font-[family-name:var(--font-heading)] text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              Navigate
            </h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/shows"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Shows
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="md:col-span-2">
            <h3 className="font-[family-name:var(--font-heading)] text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              Account
            </h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-8 md:flex-row">
          <p className="text-xs tracking-wide text-muted-foreground">
            &copy; {new Date().getFullYear()} Apostle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
