"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, Cpu, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════
   Onboarding dialogue script
   ═══════════════════════════════════════════ */

const SYSTEM_QUESTIONS = [
    {
        prompt: "まず教えてください。あなたの名前、もしくはニックネームは何ですか？",
        delay: 1200,
    },
    {
        prompt:
            "休日は、外でアクティブに過ごすのと、家で映画やゲームに没頭するの、どちらが好きですか？",
        delay: 1500,
    },
    {
        prompt: "絶対に許せない他人の行動はありますか？",
        delay: 1500,
    },
];

const FINAL_MESSAGE = "プロファイリング完了。エージェントを稼働します。";
const REDIRECT_DELAY = 3000;

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

type ChatMsg = {
    id: number;
    role: "system" | "user";
    text: string;
};

/* ═══════════════════════════════════════════
   Components
   ═══════════════════════════════════════════ */

function TypingIndicator() {
    return (
        <div className="flex items-center gap-3 max-w-[80%]">
            <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
            </div>
        </div>
    );
}

function Bubble({ msg }: { msg: ChatMsg }) {
    const isSystem = msg.role === "system";

    return (
        <div
            className={cn(
                "flex gap-2.5 max-w-[85%] tp-fade-slide-in",
                !isSystem && "ml-auto"
            )}
        >
            {isSystem && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mt-0.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
            )}

            <div
                className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    isSystem
                        ? "bg-white/[0.04] border border-white/[0.06] text-gray-200 rounded-bl-md"
                        : "bg-tp-accent/20 border border-tp-accent/20 text-gray-100 rounded-br-md"
                )}
            >
                {msg.text}
            </div>

            {!isSystem && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-tp-accent/15 border border-tp-accent/20 flex items-center justify-center mt-0.5">
                    <Bot className="w-4 h-4 text-tp-accent" />
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

export default function OnboardingPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState("");
    const [questionIndex, setQuestionIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const nextId = useRef(1);

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        });
    }, []);

    const addSystemMessage = useCallback(
        (text: string, delay: number) => {
            setIsTyping(true);
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    { id: nextId.current++, role: "system", text },
                ]);
                setIsTyping(false);
                setTimeout(() => {
                    scrollToBottom();
                    inputRef.current?.focus();
                }, 100);
            }, delay);
        },
        [scrollToBottom]
    );

    // Initial greeting + first question
    useEffect(() => {
        const t1 = setTimeout(() => {
            setMessages([
                {
                    id: nextId.current++,
                    role: "system",
                    text: "あなたのデジタルツインを初期化します。",
                },
            ]);
            scrollToBottom();
        }, 600);

        const t2 = setTimeout(() => {
            addSystemMessage(SYSTEM_QUESTIONS[0].prompt, 0);
        }, 2000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSend = () => {
        const text = input.trim();
        if (!text || isTyping || isComplete) return;

        // Add user message
        setMessages((prev) => [
            ...prev,
            { id: nextId.current++, role: "user", text },
        ]);
        setInput("");
        scrollToBottom();

        const nextQ = questionIndex + 1;

        if (nextQ < SYSTEM_QUESTIONS.length) {
            // Next question
            setQuestionIndex(nextQ);
            addSystemMessage(
                SYSTEM_QUESTIONS[nextQ].prompt,
                SYSTEM_QUESTIONS[nextQ].delay
            );
        } else {
            // Onboarding complete
            setIsComplete(true);
            setIsTyping(true);
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: nextId.current++,
                        role: "system",
                        text: FINAL_MESSAGE,
                    },
                ]);
                setIsTyping(false);
                setRedirecting(true);
                scrollToBottom();
                setTimeout(() => {
                    router.push("/home");
                }, REDIRECT_DELAY);
            }, 2000);
        }
    };

    // Progress bar percentage
    const progress = Math.min(
        ((questionIndex + (isComplete ? 1 : 0)) / SYSTEM_QUESTIONS.length) *
        100,
        100
    );

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[oklch(0.13_0.01_260)]">
            {/* ── Ambient glow ── */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-tp-accent/[0.03] rounded-full blur-[100px] pointer-events-none" />

            {/* ── Header ── */}
            <header className="relative z-10 flex items-center justify-between px-5 pt-14 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                            Initializing
                        </span>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-white/90">
                        Digital Twin Setup
                    </h1>
                </div>

                <div className="text-right">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">
                        Step {Math.min(questionIndex + 1, SYSTEM_QUESTIONS.length)}/{SYSTEM_QUESTIONS.length}
                    </span>
                </div>
            </header>

            {/* ── Progress bar ── */}
            <div className="relative z-10 mx-5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* ── Chat area ── */}
            <div
                ref={scrollRef}
                className="relative z-10 flex-1 overflow-y-auto px-5 py-6 space-y-5 scrollbar-none"
            >
                {messages.map((msg) => (
                    <Bubble key={msg.id} msg={msg} />
                ))}
                {isTyping && <TypingIndicator />}
            </div>

            {/* ── Redirect indicator ── */}
            {redirecting && (
                <div className="relative z-10 flex items-center justify-center gap-2 py-3 tp-fade-slide-in">
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span className="text-xs text-white/50">
                        Observation Deck へ遷移中…
                    </span>
                </div>
            )}

            {/* ── Input area ── */}
            {!isComplete && (
                <div className="relative z-10 px-4 pb-6 pt-2">
                    <div className="flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-3">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="メッセージを入力…"
                            rows={1}
                            disabled={isTyping}
                            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 resize-none outline-none min-h-[36px] max-h-[120px] py-2 disabled:opacity-40"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="shrink-0 w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
