import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu, Shield, User, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, useLogout } from "@/features/auth/auth-hooks";
import { isAdmin } from "@/lib/auth/permissions";

interface HeaderProps {
  readonly serverSession?: { user: Record<string, unknown> } | null;
}

export function Header({ serverSession }: HeaderProps = {}) {
  const { data: clientSession } = useSession();
  const session = serverSession ?? clientSession;
  const logout = useLogout();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user;
  const userIsAdmin = isAdmin(user?.role as string | undefined);

  const navLinks = [
    { label: "Courses", to: "/#courses" },
    { label: "Pricing", to: "/pricing" as const },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="container flex h-18 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-[0.25em] uppercase">
              Apostle
            </span>
          </Link>

          {/* Desktop Nav - pill-shaped links */}
          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) =>
              link.to.startsWith("/#") ? (
                <a
                  key={link.to}
                  href={link.to}
                  className="rounded-full border border-border/60 px-5 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground transition-all duration-200 hover:border-foreground/40 hover:text-foreground hover:bg-foreground/5"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-full border border-border/60 px-5 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground transition-all duration-200 hover:border-foreground/40 hover:text-foreground hover:bg-foreground/5"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-full border border-border/60 px-4 uppercase tracking-[0.1em] text-xs transition-all duration-200 hover:border-foreground/40 hover:bg-foreground/5"
                  >
                    <User className="size-3.5" />
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border/60 p-2">
                  <DropdownMenuLabel className="px-3 py-2 font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="font-[family-name:var(--font-heading)] text-sm font-semibold leading-none tracking-wide">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2 bg-border/50" />
                  <DropdownMenuItem
                    className="mx-1 rounded-lg px-3 py-2 cursor-pointer"
                    onClick={() => navigate({ to: "/dashboard" })}
                  >
                    <LayoutDashboard className="mr-2.5 size-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="mx-1 rounded-lg px-3 py-2 cursor-pointer"
                    onClick={() => navigate({ to: "/account" })}
                  >
                    <User className="mr-2.5 size-4" />
                    Account
                  </DropdownMenuItem>
                  {userIsAdmin && (
                    <DropdownMenuItem
                      className="mx-1 rounded-lg px-3 py-2 cursor-pointer"
                      onClick={() => navigate({ to: "/admin" })}
                    >
                      <Shield className="mr-2.5 size-4" />
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="mx-2 bg-border/50" />
                  <DropdownMenuItem
                    className="mx-1 rounded-lg px-3 py-2 cursor-pointer"
                    onClick={() => logout.mutate()}
                  >
                    <LogOut className="mr-2.5 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-border/60 px-5 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground transition-all duration-200 hover:border-foreground/40 hover:text-foreground hover:bg-foreground/5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full border border-foreground/80 bg-foreground px-5 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-all duration-200 hover:bg-foreground/90"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            onClick={() => setMobileOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setMobileOpen(true);
            }}
          >
            <Menu className="size-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background">
          <div className="container flex h-18 items-center justify-between">
            <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-[0.25em] uppercase">
              Apostle
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setMobileOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setMobileOpen(false);
              }}
            >
              <X className="size-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-6">
            {navLinks.map((link) =>
              link.to.startsWith("/#") ? (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-border/60 px-8 py-3 font-[family-name:var(--font-heading)] text-lg font-semibold uppercase tracking-[0.25em] text-foreground transition-all duration-200 hover:border-foreground/40 hover:bg-foreground/5"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-border/60 px-8 py-3 font-[family-name:var(--font-heading)] text-lg font-semibold uppercase tracking-[0.25em] text-foreground transition-all duration-200 hover:border-foreground/40 hover:bg-foreground/5"
                >
                  {link.label}
                </Link>
              ),
            )}
            <div className="mt-6 w-56 border-t border-border/40 pt-8">
              {user ? (
                <div className="flex flex-col items-center gap-5">
                  <p className="text-xs text-muted-foreground tracking-wide">{user.email}</p>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:text-foreground"
                  >
                    Account
                  </Link>
                  {userIsAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="font-[family-name:var(--font-heading)] text-sm font-medium uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:text-foreground"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    className="mt-2 w-full rounded-full border border-border/60 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-foreground transition-all duration-200 hover:border-foreground/40 hover:bg-foreground/5"
                    onClick={() => {
                      logout.mutate();
                      setMobileOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        logout.mutate();
                        setMobileOpen(false);
                      }
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-full border border-border/60 px-6 py-2.5 text-center text-xs font-medium uppercase tracking-[0.15em] text-foreground transition-all duration-200 hover:border-foreground/40 hover:bg-foreground/5"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-full border border-foreground/80 bg-foreground px-6 py-2.5 text-center text-xs font-medium uppercase tracking-[0.15em] text-background transition-all duration-200 hover:bg-foreground/90"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
