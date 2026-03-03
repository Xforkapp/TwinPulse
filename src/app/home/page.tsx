"use client";

import {
    Heart,
    Lightbulb,
    AlertTriangle,
    TrendingUp,
    MessageCircle,
    Shield,
    Sparkles,
    Activity,
    type LucideIcon,
} from "lucide-react";
import { useAppStore, type ActivityLog } from "@/store";
import { useHydrated } from "@/store/useHydrated";

/* ── Icon resolver ── */

const iconMap: Record<string, LucideIcon> = {
    Heart,
    Lightbulb,
    AlertTriangle,
    TrendingUp,
    MessageCircle,
    Shield,
    Sparkles,
};

/* ── Component ── */

export default function HomePage() {
    const activityLogs = useAppStore((s) => s.activityLogs);
    const chatHistories = useAppStore((s) => s.chatHistories);
    const hydrated = useHydrated();

    const activeAgents = 2;
    const totalAgents = 5;

    /* Derive stats from store */
    const todayActivities = activityLogs.length;
    const avgIntimacy =
        chatHistories.length > 0
            ? Math.round(
                chatHistories.reduce((sum, h) => sum + h.intimacyScore, 0) /
                chatHistories.length
            )
            : 0;
    const newMatches = activityLogs.filter((l) =>
        l.title.includes("マッチ")
    ).length;

    if (!hydrated) {
        return (
            <div className="animate-page-in flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-tp-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-page-in space-y-6">
            {/* ── Header ── */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">
                    Observation Deck
                </h1>
                <p className="text-sm text-muted-foreground">
                    AIエージェントの稼働状況をリアルタイムで監視
                </p>
            </div>

            {/* ── Agent status bar ── */}
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4">
                <div className="relative flex items-center justify-center">
                    <Activity className="w-5 h-5 text-tp-accent" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-card" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">稼働中エージェント</p>
                    <p className="text-xs text-muted-foreground">
                        すべてのシステムは正常に動作中
                    </p>
                </div>

                <div className="flex items-baseline gap-0.5 shrink-0">
                    <span className="text-2xl font-bold text-tp-accent">
                        {activeAgents}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        / {totalAgents}
                    </span>
                </div>
            </div>

            {/* ── Compact stats ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    {
                        label: "今日の活動",
                        value: String(todayActivities),
                        unit: "件",
                    },
                    {
                        label: "平均親密度",
                        value: String(avgIntimacy),
                        unit: "%",
                    },
                    { label: "新規マッチ", value: String(newMatches), unit: "件" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="rounded-2xl border border-border bg-card px-4 py-3.5 text-center space-y-0.5"
                    >
                        <p className="text-xl font-bold">
                            {s.value}
                            <span className="text-xs font-normal text-muted-foreground ml-0.5">
                                {s.unit}
                            </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Timeline ── */}
            <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Activity Timeline
                </h2>

                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                    <div className="space-y-3">
                        {activityLogs.map((event, idx) => {
                            const IconComp =
                                iconMap[event.icon] ?? Sparkles;
                            return (
                                <div key={event.id} className="relative pl-12">
                                    {/* Icon dot */}
                                    <div
                                        className={`absolute left-[10px] top-4 z-10 flex items-center justify-center w-[22px] h-[22px] rounded-full ${event.iconBg} ring-[3px] ring-background`}
                                    >
                                        <IconComp
                                            className={`w-3 h-3 ${event.iconColor}`}
                                        />
                                    </div>

                                    {/* Card */}
                                    <div
                                        className="rounded-2xl border border-border bg-card p-4 shadow-[0_2px_12px_rgba(0,0,0,0.25)] hover:bg-tp-surface-hover transition-colors duration-200"
                                        style={{
                                            animationDelay: `${idx * 60}ms`,
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span
                                                className={`text-[10px] font-semibold uppercase tracking-wider ${event.iconColor}`}
                                            >
                                                {event.agent}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {event.timestamp}
                                            </span>
                                        </div>

                                        <p className="text-sm font-semibold mb-1">
                                            {event.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {event.body}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
