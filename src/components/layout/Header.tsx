import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Shield, User, X } from "lucide-react";
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

export function Header() {
  const { data: session } = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user;
  const userIsAdmin = isAdmin(user?.role as string | undefined);

  const navLinks = [
    { label: "Shows", to: "/shows" as const },
    { label: "Pricing", to: "/pricing" as const },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold tracking-[0.2em] uppercase">Apostle</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-sm font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 uppercase tracking-wider text-xs">
                    <User className="size-4" />
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/account" })}>
                    <User className="mr-2 size-4" />
                    Account
                  </DropdownMenuItem>
                  {userIsAdmin && (
                    <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                      <Shield className="mr-2 size-4" />
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout.mutate()}>
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="uppercase tracking-wider text-xs" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" className="rounded-full px-6 uppercase tracking-wider text-xs" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setMobileOpen(true); }}
          >
            <Menu className="size-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col">
          <div className="container flex h-16 items-center justify-between">
            <span className="text-xl font-bold tracking-[0.2em] uppercase">Apostle</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setMobileOpen(false); }}
            >
              <X className="size-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-3xl font-bold uppercase tracking-[0.3em] text-foreground transition-opacity hover:opacity-60"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-border pt-8 w-48">
              {user ? (
                <div className="flex flex-col items-center gap-6">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium uppercase tracking-widest"
                  >
                    Account
                  </Link>
                  {userIsAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium uppercase tracking-widest"
                    >
                      Admin
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full rounded-full uppercase tracking-wider"
                    onClick={() => {
                      logout.mutate();
                      setMobileOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    variant="outline"
                    className="w-full rounded-full uppercase tracking-wider"
                    asChild
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button
                    className="w-full rounded-full uppercase tracking-wider"
                    asChild
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
