"use client";

import { useState, useRef } from "react";
import {
    Bot,
    Heart,
    Info,
    ArrowRight,
    Sparkles,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type ChatMessage, type ChatHistory } from "@/store";
import { useHydrated } from "@/store/useHydrated";

/* ── Intimacy Ring Component ── */

function IntimacyGauge({
    score,
    partnerName,
    commonInterests,
    chatCount,
    lastChatDate,
}: {
    score: number;
    partnerName: string;
    commonInterests: string[];
    chatCount: number;
    lastChatDate: string;
}) {
    const radius = 40;
    const stroke = 5;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-[100px] h-[100px] shrink-0">
                <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="oklch(1 0 0 / 6%)"
                        strokeWidth={stroke}
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="url(#intimacy-gradient)"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient
                            id="intimacy-gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="oklch(0.65 0.25 300)"
                            />
                            <stop
                                offset="100%"
                                stopColor="oklch(0.62 0.19 250)"
                            />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold">{score}%</span>
                    <span className="text-[9px] text-muted-foreground -mt-0.5">
                        親密度
                    </span>
                </div>
            </div>

            <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span className="text-sm font-semibold">{partnerName}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                    共通の趣味: {commonInterests.join(" · ")}
                    <br />
                    会話回数: {chatCount} 回 · 前回: {lastChatDate}
                </p>
            </div>
        </div>
    );
}

/* ── Swipe-to-Takeover Button ── */

function TakeoverButton() {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const trackWidthRef = useRef(0);
    const threshold = 0.75;

    const handleStart = (clientX: number) => {
        if (isComplete) return;
        setIsDragging(true);
        startXRef.current = clientX;
        if (trackRef.current) {
            trackWidthRef.current =
                trackRef.current.getBoundingClientRect().width - 52;
        }
    };

    const handleMove = (clientX: number) => {
        if (!isDragging || isComplete) return;
        const delta = Math.max(
            0,
            Math.min(clientX - startXRef.current, trackWidthRef.current)
        );
        setDragX(delta);
    };

    const handleEnd = () => {
        if (!isDragging || isComplete) return;
        setIsDragging(false);
        if (dragX / trackWidthRef.current >= threshold) {
            setDragX(trackWidthRef.current);
            setIsComplete(true);
        } else {
            setDragX(0);
        }
    };

    return (
        <div
            ref={trackRef}
            className="relative h-14 rounded-2xl border border-border bg-card overflow-hidden select-none touch-none"
        >
            <div
                className="absolute inset-y-0 left-0 rounded-2xl transition-colors duration-200"
                style={{
                    width: `${dragX + 52}px`,
                    background: isComplete
                        ? "oklch(0.55 0.2 145 / 25%)"
                        : "oklch(0.62 0.19 250 / 12%)",
                }}
            />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span
                    className={cn(
                        "text-xs font-semibold uppercase tracking-widest transition-opacity duration-300",
                        isComplete
                            ? "text-emerald-400"
                            : "text-muted-foreground"
                    )}
                >
                    {isComplete
                        ? "✓ TAKEOVER 完了"
                        : "スワイプして TAKEOVER →"}
                </span>
            </div>

            <div
                className={cn(
                    "absolute top-1.5 left-1.5 w-11 h-11 rounded-xl flex items-center justify-center cursor-grab",
                    isComplete
                        ? "bg-emerald-500 cursor-default"
                        : "bg-tp-accent shadow-lg shadow-tp-accent/30",
                    isDragging && "cursor-grabbing scale-95",
                    !isDragging &&
                    !isComplete &&
                    "transition-transform duration-300"
                )}
                style={{
                    transform: `translateX(${dragX}px)`,
                    transition: isDragging
                        ? "none"
                        : "transform 0.3s ease-out",
                }}
                onMouseDown={(e) => handleStart(e.clientX)}
                onMouseMove={(e) => handleMove(e.clientX)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                onTouchEnd={handleEnd}
            >
                <ArrowRight
                    className={cn(
                        "w-5 h-5 text-white transition-transform",
                        isComplete && "rotate-90"
                    )}
                />
            </div>
        </div>
    );
}

/* ── Chat Bubble ── */

function ChatBubble({ message }: { message: ChatMessage }) {
    const isMine = message.sender === "mine";

    return (
        <div className={cn("flex gap-2.5 max-w-[88%]", isMine && "ml-auto")}>
            {!isMine && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-rose-400/15 flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-rose-400" />
                </div>
            )}

            <div className={cn("space-y-1", isMine && "items-end")}>
                <div
                    className={cn(
                        "flex items-center gap-1",
                        isMine && "justify-end"
                    )}
                >
                    <span
                        className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider",
                            isMine ? "text-tp-accent" : "text-rose-400"
                        )}
                    >
                        {message.agentName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {message.time}
                    </span>
                </div>

                <div
                    className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        isMine
                            ? "bg-tp-accent/15 text-foreground rounded-br-md"
                            : "bg-card border border-border text-foreground rounded-bl-md"
                    )}
                >
                    {message.text}
                </div>

                <div
                    className={cn(
                        "flex items-start gap-1 px-1",
                        isMine && "justify-end"
                    )}
                >
                    <Info className="w-3 h-3 text-muted-foreground/50 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-muted-foreground/50 leading-snug">
                        {message.annotation}
                    </span>
                </div>
            </div>

            {isMine && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-tp-accent-muted flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-tp-accent" />
                </div>
            )}
        </div>
    );
}

/* ── Main Page ── */

export default function LogPage() {
    const chatHistories = useAppStore((s) => s.chatHistories);
    const hydrated = useHydrated();

    if (!hydrated) {
        return (
            <div className="animate-page-in flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-tp-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Use the first chat history (佐藤さん)
    const chat: ChatHistory | undefined = chatHistories[0];

    if (!chat) {
        return (
            <div className="animate-page-in flex flex-col items-center justify-center h-60 gap-3 text-muted-foreground">
                <Bot className="w-10 h-10" />
                <p className="text-sm">会話ログがありません</p>
            </div>
        );
    }

    return (
        <div className="animate-page-in flex flex-col gap-5">
            {/* ── Header ── */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">The Log</h1>
                <p className="text-sm text-muted-foreground">
                    AI同士の会話をリアルタイムで閲覧
                </p>
            </div>

            {/* ── Intimacy Gauge Card ── */}
            <div className="rounded-2xl border border-border bg-card p-5">
                <IntimacyGauge
                    score={chat.intimacyScore}
                    partnerName={chat.partnerName}
                    commonInterests={chat.commonInterests}
                    chatCount={chat.chatCount}
                    lastChatDate={chat.lastChatDate}
                />
            </div>

            {/* ── Conversation Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-tp-accent" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Conversation Log
                    </span>
                </div>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <span>最新</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* ── Chat Messages ── */}
            <div className="space-y-5">
                {chat.messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
            </div>

            {/* ── Spacer ── */}
            <div className="h-4" />

            {/* ── TAKEOVER Button ── */}
            <div className="sticky bottom-[72px] lg:bottom-4 z-40 pb-1">
                <TakeoverButton />
            </div>
        </div>
    );
}
