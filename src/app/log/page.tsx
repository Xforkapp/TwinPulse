"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
    Bot,
    Heart,
    Info,
    ArrowRight,
    Sparkles,
    ChevronDown,
    Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type ChatMessage, type ChatHistory } from "@/store";
import { useHydrated } from "@/store/useHydrated";
import { useChatSimulation } from "@/store/simulation";

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
                    {/* bg track */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="oklch(1 0 0 / 6%)"
                        strokeWidth={stroke}
                    />
                    {/* progress arc */}
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
                            <stop offset="0%" stopColor="oklch(0.65 0.25 300)" />
                            <stop offset="100%" stopColor="oklch(0.62 0.19 250)" />
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

/* ── Swipe-to-Takeover Button (Male) ── */

function TakeoverButton({ onComplete }: { onComplete: () => void }) {
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
            onComplete();
        } else {
            setDragX(0);
        }
    };

    return (
        <div
            ref={trackRef}
            className="relative h-14 rounded-2xl border border-border bg-card overflow-hidden select-none touch-none"
        >
            {/* Background fill */}
            <div
                className="absolute inset-y-0 left-0 rounded-2xl transition-colors duration-200"
                style={{
                    width: `${dragX + 52}px`,
                    background: isComplete
                        ? "oklch(0.55 0.2 145 / 25%)"
                        : "oklch(0.62 0.19 250 / 12%)",
                }}
            />

            {/* Label */}
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
                        : "スワイプして TAKEOVER (¥500) →"}
                </span>
            </div>

            {/* Draggable thumb */}
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

/* ── Chat Input Form ── */

function ChatInputForm({ partnerName }: { partnerName: string }) {
    const [text, setText] = useState("");
    const addMessage = useAppStore((s) => s.addMessage);

    const handleSend = () => {
        if (!text.trim()) return;
        const now = new Date();
        addMessage("sato", {
            sender: "mine",
            agentName: "あなた",
            text: text.trim(),
            annotation: "※ あなた自身のメッセージです",
            time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
        });
        setText("");
    };

    return (
        <div className="tp-fade-slide-in flex items-end gap-2 rounded-2xl border border-border bg-card p-3">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder={`${partnerName}にメッセージを送信...`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[36px] max-h-[120px] py-2"
            />
            <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="shrink-0 w-9 h-9 rounded-xl bg-tp-accent text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
    );
}

/* ── Toast Notification ── */

function TakeoverToast({ partnerName, onDone }: { partnerName: string; onDone: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onDone, 4200);
        return () => clearTimeout(timer);
    }, [onDone]);

    return (
        <div className="fixed top-1/2 right-4 z-[9999] tp-toast">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/90 backdrop-blur-lg shadow-xl shadow-emerald-500/20 border border-emerald-400/30">
                <Sparkles className="w-4 h-4 text-white shrink-0" />
                <span className="text-sm font-semibold text-white whitespace-nowrap">
                    {partnerName}がルームを開設しました！
                </span>
            </div>
        </div>
    );
}

/* ── Gender Toggle (dev) ── */

function GenderToggle() {
    const gender = useAppStore((s) => s.gender);
    const setGender = useAppStore((s) => s.setGender);

    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">デモ:</span>
            <button
                onClick={() => { setGender("male"); useAppStore.setState({ isTakeover: false }); }}
                className={cn(
                    "px-3 py-1 rounded-full border transition-all text-xs font-medium",
                    gender === "male"
                        ? "bg-tp-accent/15 border-tp-accent text-tp-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                )}
            >
                ♂ 男性
            </button>
            <button
                onClick={() => { setGender("female"); useAppStore.setState({ isTakeover: false }); }}
                className={cn(
                    "px-3 py-1 rounded-full border transition-all text-xs font-medium",
                    gender === "female"
                        ? "bg-rose-400/15 border-rose-400 text-rose-400"
                        : "border-border text-muted-foreground hover:text-foreground"
                )}
            >
                ♀ 女性
            </button>
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
    const gender = useAppStore((s) => s.gender);
    const isTakeover = useAppStore((s) => s.isTakeover);
    const activateTakeover = useAppStore((s) => s.activateTakeover);
    const hydrated = useHydrated();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [showFlash, setShowFlash] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [femaleInputReady, setFemaleInputReady] = useState(false);

    const scrollToBottom = useCallback(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Auto-add messages every 5-12 seconds & bump intimacy (only while AI mode)
    useChatSimulation(isTakeover ? "__disabled__" : "sato", scrollToBottom);

    // Auto-scroll when new messages arrive
    const chat: ChatHistory | undefined = chatHistories[0];
    const messageCount = chat?.messages.length ?? 0;
    useEffect(() => {
        if (messageCount > 0) scrollToBottom();
    }, [messageCount, scrollToBottom]);

    // Female mock: simulate partner takeover after 8 seconds
    useEffect(() => {
        if (gender !== "female" || isTakeover) return;
        const timer = setTimeout(() => {
            activateTakeover();
            setShowToast(true);
            setTimeout(() => setFemaleInputReady(true), 800);
        }, 8000);
        return () => clearTimeout(timer);
    }, [gender, isTakeover, activateTakeover]);

    // Reset local UI state when gender changes
    useEffect(() => {
        setShowFlash(false);
        setFemaleInputReady(false);
        setShowToast(false);
    }, [gender]);

    const handleMaleTakeover = () => {
        setShowFlash(true);
        setTimeout(() => {
            activateTakeover();
            setShowFlash(false);
        }, 800);
    };

    if (!hydrated) {
        return (
            <div className="animate-page-in flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-tp-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

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
            {/* ── Flash overlay ── */}
            {showFlash && (
                <div className="fixed inset-0 z-[9999] bg-white tp-flash-overlay pointer-events-none" />
            )}

            {/* ── Toast ── */}
            {showToast && (
                <TakeoverToast
                    partnerName={chat.partnerName}
                    onDone={() => setShowToast(false)}
                />
            )}

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">The Log</h1>
                    <p className="text-sm text-muted-foreground">
                        {isTakeover ? "生身の会話モード" : "AI同士の会話をリアルタイムで閲覧"}
                    </p>
                </div>
                <GenderToggle />
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
                        {isTakeover ? "Live Chat" : "Conversation Log"}
                    </span>
                    {isTakeover && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            Live
                        </span>
                    )}
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
                <div ref={chatEndRef} />
            </div>

            {/* ── Spacer ── */}
            <div className="h-4" />

            {/* ── Bottom Action Area ── */}
            <div className="sticky bottom-[72px] lg:bottom-4 z-40 pb-1 space-y-3">
                {/* Male: TAKEOVER button or input */}
                {gender === "male" && !isTakeover && (
                    <TakeoverButton onComplete={handleMaleTakeover} />
                )}
                {gender === "male" && isTakeover && (
                    <ChatInputForm partnerName={chat.partnerName} />
                )}

                {/* Female: Waiting message */}
                {gender === "female" && !isTakeover && (
                    <div className="flex items-center justify-center gap-2 py-4 px-5 rounded-2xl border border-border bg-card">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs text-muted-foreground">
                            お相手からのアプローチ（TAKEOVER）をお待ちください
                        </span>
                    </div>
                )}
                {gender === "female" && isTakeover && femaleInputReady && (
                    <ChatInputForm partnerName={chat.partnerName} />
                )}
            </div>
        </div>
    );
}
