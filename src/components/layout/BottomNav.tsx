"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, SlidersHorizontal, Dna } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/home", label: "ホーム", icon: Home },
    { href: "/log", label: "チャット", icon: MessageSquare },
    { href: "/training", label: "育成", icon: Dna },
    { href: "/tuning", label: "チューニング", icon: SlidersHorizontal },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="flex lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-surface border-t border-border">
            <div className="flex w-full items-center justify-around px-2 py-1 safe-area-bottom">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px]",
                                isActive
                                    ? "text-tp-accent"
                                    : "text-muted-foreground active:scale-95"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "w-5 h-5 transition-all duration-200",
                                    isActive && "drop-shadow-[0_0_6px_oklch(0.62_0.19_250)]"
                                )}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {isActive && (
                                <span className="absolute -bottom-0 w-5 h-0.5 rounded-full bg-tp-accent" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
