"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui";

interface NavbarProps {
  user?: {
    name?: string | null;
    image?: string | null;
    username?: string | null;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/battle", label: "Battle" },
    { href: "/drop", label: "Drop" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/battle" className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-primary" />
            <span className="font-bold">Selectd</span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden items-center space-x-6 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {user && (
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-accent"
              >
                <Avatar src={user.image} name={user.name} size="sm" />
                <span className="hidden text-sm font-medium sm:inline-block">
                  {user.username || user.name || "Player"}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur lg:hidden supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-around px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
              pathname === "/profile"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Profile
          </Link>
        </div>
      </nav>
    </>
  );
}
