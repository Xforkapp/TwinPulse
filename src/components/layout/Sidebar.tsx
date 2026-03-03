"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/log", label: "チャット", icon: MessageSquare },
  { href: "/tuning", label: "チューニング", icon: SlidersHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] border-r border-border bg-sidebar z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-tp-accent flex items-center justify-center">
          <span className="text-white font-bold text-sm">TP</span>
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          TwinPulse
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-tp-accent-muted text-tp-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-tp-surface-hover"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-tp-accent" : "text-muted-foreground"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-tp-surface flex items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              ゲストユーザー
            </p>
            <p className="text-xs text-muted-foreground truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
