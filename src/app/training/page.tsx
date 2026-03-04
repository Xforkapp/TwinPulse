"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Send,
    Bot,
    Cpu,
    Paperclip,
    Image as ImageIcon,
    CheckCircle2,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { useHydrated } from "@/store/useHydrated";

/* ═══════════════════════════════════════════
   AI feedback pool
   ═══════════════════════════════════════════ */

const textFeedback = [
    "なるほど、{INPUT}が好きなんですね！プロフィール情報（ベクトルデータ）を更新しました 📝",
    "「{INPUT}」…了解しました。あなたの性格マップにこの傾向を追加しました ✅",
    "面白いですね！「{INPUT}」をキーワードとしてあなたの興味プロファイルに反映しました 🎯",
    "ありがとうございます！「{INPUT}」を元に、マッチング精度の向上に活用させていただきます 🧠",
    "新しい情報ですね。学習データベースを更新中… 完了しました！シンクロ率が上がりました ⬆️",
    "なるほど、そういう一面もあるんですね。パーソナリティモデルを再構築しました 🔄",
];

const imageFeedback = [
    "画像を受け取りました！顔認識データとビジュアルプロファイルを更新中… 完了しました 📸",
    "写真ありがとうございます！画像分析の結果をプロフィールに反映しました。表情の特徴を学習しています 🤖",
    "この写真から趣味・ライフスタイルの傾向を検出しました。ベクトルデータに追加済みです 🖼️",
];

const syncMessages: Record<number, string> = {
    50: "基本的な性格傾向の学習が完了しました",
    60: "趣味・嗜好のパターンが見えてきました",
    70: "コミュニケーションスタイルを把握しました",
    80: "かなり深いレベルであなたを理解しています",
    90: "ほぼ完全にあなたの分身として機能できます",
};

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

type TrainingMsg = {
    id: number;
    role: "user" | "ai";
    text: string;
    isImage?: boolean;
};

/* ═══════════════════════════════════════════
   Sync Rate Bar
   ═══════════════════════════════════════════ */

function SyncRateBar({ rate }: { rate: number }) {
    const statusText =
        rate < 50
            ? "まだあなたのことを学習中です"
            : rate < 70
                ? "趣味・性格の傾向が見えてきました"
                : rate < 85
                    ? "かなり深くあなたを理解しています"
                    : "ほぼ完全にシンクロしています";

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        シンクロ率 {rate}%
                    </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                    {statusText}
                </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 transition-all duration-1000 ease-out"
                    style={{ width: `${rate}%` }}
                />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   Chat Bubble
   ═══════════════════════════════════════════ */

function TrainingBubble({ msg }: { msg: TrainingMsg }) {
    const isAI = msg.role === "ai";

    return (
        <div
            className={cn(
                "flex gap-2.5 max-w-[85%] tp-fade-slide-in",
                !isAI && "ml-auto"
            )}
        >
            {isAI && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center mt-0.5">
                    <Bot className="w-4 h-4 text-cyan-400" />
                </div>
            )}

            <div className="space-y-1">
                <div
                    className={cn(
                        "flex items-center gap-1",
                        !isAI && "justify-end"
                    )}
                >
                    <span
                        className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider",
                            isAI ? "text-cyan-400" : "text-tp-accent"
                        )}
                    >
                        {isAI ? "My Clone AI" : "あなた"}
                    </span>
                </div>

                <div
                    className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        isAI
                            ? "bg-white/[0.04] border border-white/[0.06] text-gray-200 rounded-bl-md"
                            : msg.isImage
                                ? "bg-violet-500/15 border border-violet-500/20 text-gray-200 rounded-br-md"
                                : "bg-tp-accent/15 border border-tp-accent/20 text-gray-100 rounded-br-md"
                    )}
                >
                    {msg.isImage && (
                        <div className="flex items-center gap-2 mb-1">
                            <ImageIcon className="w-4 h-4 text-violet-400" />
                            <span className="text-xs text-violet-400 font-medium">
                                画像を送信
                            </span>
                        </div>
                    )}
                    {msg.text}
                </div>
            </div>

            {!isAI && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-tp-accent/15 border border-tp-accent/20 flex items-center justify-center mt-0.5">
                    <Sparkles className="w-4 h-4 text-tp-accent" />
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════
   Typing Indicator
   ═══════════════════════════════════════════ */

function TypingIndicator() {
    return (
        <div className="flex items-center gap-3 max-w-[80%]">
            <div className="shrink-0 w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

export default function TrainingPage() {
    const syncRate = useAppStore((s) => s.syncRate);
    const setSyncRate = useAppStore((s) => s.setSyncRate);
    const hydrated = useHydrated();

    const [messages, setMessages] = useState<TrainingMsg[]>([
        {
            id: 0,
            role: "ai",
            text: "こんにちは！私はあなたのクローンAIです。あなたのことをもっと教えてください。趣味、好きな食べ物、休日の過ごし方… 何でもOKです！学習するほど、あなたの分身として正確に振る舞えるようになります 🧠",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
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

    const addAIResponse = useCallback(
        (userText: string, isImage: boolean) => {
            setIsTyping(true);
            const delay = 1200 + Math.random() * 800;

            setTimeout(() => {
                const pool = isImage ? imageFeedback : textFeedback;
                const template = pool[Math.floor(Math.random() * pool.length)];
                const shortInput =
                    userText.length > 20
                        ? userText.slice(0, 20) + "…"
                        : userText;
                const responseText = template.replace("{INPUT}", shortInput);

                setMessages((prev) => [
                    ...prev,
                    { id: nextId.current++, role: "ai", text: responseText },
                ]);
                setIsTyping(false);

                // Increase sync rate by 2-5 points
                const bump = 2 + Math.floor(Math.random() * 4);
                const newRate = Math.min(99, syncRate + bump);
                setSyncRate(newRate);

                // Check for milestone messages
                const milestoneKeys = Object.keys(syncMessages).map(Number);
                for (const threshold of milestoneKeys) {
                    if (syncRate < threshold && newRate >= threshold) {
                        setTimeout(() => {
                            setMessages((prev) => [
                                ...prev,
                                {
                                    id: nextId.current++,
                                    role: "ai",
                                    text: `🎉 マイルストーン達成！${syncMessages[threshold]}`,
                                },
                            ]);
                            scrollToBottom();
                        }, 1500);
                        break;
                    }
                }

                setTimeout(scrollToBottom, 100);
                inputRef.current?.focus();
            }, delay);
        },
        [syncRate, setSyncRate, scrollToBottom]
    );

    const handleSend = () => {
        const text = input.trim();
        if (!text || isTyping) return;

        setMessages((prev) => [
            ...prev,
            { id: nextId.current++, role: "user", text },
        ]);
        setInput("");
        scrollToBottom();
        addAIResponse(text, false);
    };

    const handleImageUpload = () => {
        if (isTyping) return;
        const mockName = "photo_" + Date.now() + ".jpg";
        setMessages((prev) => [
            ...prev,
            {
                id: nextId.current++,
                role: "user",
                text: mockName,
                isImage: true,
            },
        ]);
        scrollToBottom();
        addAIResponse(mockName, true);
    };

    if (!hydrated) {
        return (
            <div className="animate-page-in flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-page-in flex flex-col h-[calc(100dvh-72px)] lg:h-dvh -mx-4 lg:-mx-0 -mt-6 lg:-mt-0">
            {/* ── Header ── */}
            <div className="px-5 pt-5 pb-4 space-y-4 border-b border-white/[0.06] bg-[oklch(0.14_0.01_260)]">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h1 className="text-lg font-bold tracking-tight">
                            My Clone Chat
                        </h1>
                        <p className="text-[11px] text-muted-foreground">
                            あなたのAIを育てましょう
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] font-semibold text-cyan-400">
                            学習中
                        </span>
                    </div>
                </div>
                <SyncRateBar rate={syncRate} />
            </div>

            {/* ── Chat Area ── */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[oklch(0.12_0.008_260)] scrollbar-none"
            >
                {messages.map((msg) => (
                    <TrainingBubble key={msg.id} msg={msg} />
                ))}
                {isTyping && <TypingIndicator />}
            </div>

            {/* ── Input Area ── */}
            <div className="px-4 pb-4 pt-2 bg-[oklch(0.14_0.01_260)] border-t border-white/[0.06]">
                <div className="flex items-end gap-2">
                    {/* Image upload button */}
                    <button
                        onClick={handleImageUpload}
                        disabled={isTyping}
                        className="shrink-0 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-violet-400 hover:border-violet-400/30 transition-all disabled:opacity-30"
                        title="画像を添付"
                    >
                        <Paperclip className="w-4.5 h-4.5" />
                    </button>

                    {/* Text input */}
                    <div className="flex-1 flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2.5">
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
                            placeholder="趣味や好きなことを教えてください…"
                            rows={1}
                            disabled={isTyping}
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[32px] max-h-[100px] py-1 disabled:opacity-40"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="shrink-0 w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
