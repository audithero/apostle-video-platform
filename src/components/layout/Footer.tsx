import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="text-2xl font-bold tracking-[0.2em] uppercase">Apostle</span>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Premium culinary experiences. Stream exclusive cooking shows and masterclasses from world-class chefs.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Navigate</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/shows" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Shows
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/login" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Apostle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
