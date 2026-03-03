"use client";

import { useRef, type KeyboardEvent } from "react";
import {
    Bot,
    X,
    Plus,
    Sparkles,
    Brain,
    ShieldAlert,
    Zap,
    Ear,
    Swords,
    MessageCircleWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type SliderValues } from "@/store";
import { useHydrated } from "@/store/useHydrated";

/* ── Types ── */

type SliderConfig = {
    id: keyof SliderValues;
    labelLeft: string;
    labelRight: string;
    iconLeft: React.ReactNode;
    iconRight: React.ReactNode;
};

/* ── Config ── */

const sliderConfigs: SliderConfig[] = [
    {
        id: "boldness",
        labelLeft: "慎重",
        labelRight: "大胆",
        iconLeft: <ShieldAlert className="w-4 h-4" />,
        iconRight: <Zap className="w-4 h-4" />,
    },
    {
        id: "initiative",
        labelLeft: "聞き役",
        labelRight: "主導権",
        iconLeft: <Ear className="w-4 h-4" />,
        iconRight: <Swords className="w-4 h-4" />,
    },
    {
        id: "sharpness",
        labelLeft: "控えめ",
        labelRight: "毒舌",
        iconLeft: <MessageCircleWarning className="w-4 h-4" />,
        iconRight: <Brain className="w-4 h-4" />,
    },
];

/* ── Personality Preview ── */

function getPersonalityType(values: SliderValues): {
    label: string;
    description: string;
} {
    const { boldness, initiative, sharpness } = values;

    if (sharpness > 70) {
        return {
            label: "鋭いクリティカルシンカー",
            description:
                "ストレートな物言いで本質を突く会話スタイル。相手に新しい視点を提供するのが得意です。",
        };
    }
    if (boldness > 65 && initiative > 60) {
        return {
            label: "カリスマティックリーダー",
            description:
                "積極的に会話をリードし、大胆な話題展開で相手を魅了するタイプです。",
        };
    }
    if (boldness < 40 && initiative < 40) {
        return {
            label: "穏やかな傾聴者",
            description:
                "相手の話に寄り添い、安心感を与える温かい会話スタイル。深い信頼関係を構築します。",
        };
    }
    if (initiative > 60) {
        return {
            label: "アクティブコミュニケーター",
            description:
                "話題を豊富に提供し、会話を活性化させるタイプ。初対面でもスムーズに打ち解けます。",
        };
    }
    return {
        label: "機知に富んだインテリ",
        description:
            "バランスの取れた知的な会話スタイル。適度なユーモアと洞察力で会話を彩ります。",
    };
}

/* ── Personality Radar ── */

function PersonalityRadar({ values }: { values: SliderValues }) {
    const traits = [
        { key: "boldness" as const, label: "大胆さ" },
        { key: "initiative" as const, label: "主導性" },
        { key: "sharpness" as const, label: "鋭さ" },
    ];

    return (
        <div className="flex items-center justify-center gap-6">
            {traits.map((trait) => {
                const val = values[trait.key];
                return (
                    <div
                        key={trait.key}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="relative w-16 h-16">
                            <svg
                                className="w-full h-full -rotate-90"
                                viewBox="0 0 64 64"
                            >
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke="oklch(1 0 0 / 6%)"
                                    strokeWidth="4"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke="oklch(0.62 0.19 250)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(val / 100) * 175.9} 175.9`}
                                    className="transition-all duration-500 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold">
                                    {val}
                                </span>
                            </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                            {trait.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/* ── Slider Component ── */

function TuningSlider({
    config,
    value,
    onChange,
}: {
    config: SliderConfig;
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    {config.iconLeft}
                    <span className="text-xs font-medium">
                        {config.labelLeft}
                    </span>
                </div>
                <span className="text-xs font-bold text-tp-accent tabular-nums">
                    {value}
                </span>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="text-xs font-medium">
                        {config.labelRight}
                    </span>
                    {config.iconRight}
                </div>
            </div>

            <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="tp-slider"
            />
        </div>
    );
}

/* ── NG Keywords Chip Input ── */

function NgKeywordsInput() {
    const ngKeywords = useAppStore((s) => s.currentUserAI.ngKeywords);
    const addNgKeyword = useAppStore((s) => s.addNgKeyword);
    const removeNgKeyword = useAppStore((s) => s.removeNgKeyword);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAdd = () => {
        const input = inputRef.current;
        if (!input) return;
        const trimmed = input.value.trim();
        if (trimmed) {
            addNgKeyword(trimmed);
            input.value = "";
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {ngKeywords.map((kw) => (
                    <span
                        key={kw}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/15 text-destructive text-xs font-medium"
                    >
                        {kw}
                        <button
                            onClick={() => removeNgKeyword(kw)}
                            className="p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                            aria-label={`${kw}を削除`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    onKeyDown={handleKeyDown}
                    placeholder="NGキーワードを入力..."
                    className="flex-1 h-10 px-4 rounded-xl bg-tp-surface border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-tp-accent/40 transition-all"
                />
                <button
                    onClick={handleAdd}
                    className="h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all duration-200 bg-tp-accent text-white hover:bg-tp-accent/80"
                >
                    <Plus className="w-4 h-4" />
                    追加
                </button>
            </div>
        </div>
    );
}

/* ── Main Page ── */

export default function TuningPage() {
    const sliders = useAppStore((s) => s.currentUserAI.sliders);
    const setSliderValue = useAppStore((s) => s.setSliderValue);
    const ngKeywords = useAppStore((s) => s.currentUserAI.ngKeywords);
    const hydrated = useHydrated();

    const personality = getPersonalityType(sliders);

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
                <h1 className="text-2xl font-bold tracking-tight">Tuning</h1>
                <p className="text-sm text-muted-foreground">
                    AIエージェントの性格をカスタマイズ
                </p>
            </div>

            {/* ── 2-column layout for PC ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── LEFT COLUMN: Controls ── */}
                <div className="space-y-6">
                    {/* Profile Summary Card */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tp-accent/30 to-violet-500/20 flex items-center justify-center">
                                    <Bot className="w-8 h-8 text-tp-accent" />
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 ring-[3px] ring-card flex items-center justify-center">
                                    <Zap className="w-2.5 h-2.5 text-white" />
                                </span>
                            </div>

                            <div className="min-w-0 space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    現在のタイプ
                                </p>
                                <p className="text-base font-bold leading-tight">
                                    {personality.label}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-tp-accent" />
                                    <span className="text-[10px] text-tp-accent font-medium">
                                        リアルタイム反映
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sliders Card */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-6">
                        <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-tp-accent" />
                            <h2 className="text-sm font-semibold">
                                パーソナリティ調整
                            </h2>
                        </div>

                        {sliderConfigs.map((config) => (
                            <TuningSlider
                                key={config.id}
                                config={config}
                                value={sliders[config.id]}
                                onChange={(v) => setSliderValue(config.id, v)}
                            />
                        ))}
                    </div>

                    {/* NG Keywords Card */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-destructive" />
                            <h2 className="text-sm font-semibold">
                                NGキーワード
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground -mt-1">
                            AIが避けるべき話題を設定します
                        </p>

                        <NgKeywordsInput />
                    </div>
                </div>

                {/* ── RIGHT COLUMN: Preview ── */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-5 lg:sticky lg:top-8">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-tp-accent" />
                            <h2 className="text-sm font-semibold">
                                プレビュー
                            </h2>
                        </div>

                        <PersonalityRadar values={sliders} />

                        <div className="rounded-xl bg-tp-surface p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-tp-accent-muted flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-tp-accent" />
                                </div>
                                <span className="text-sm font-semibold">
                                    {personality.label}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {personality.description}
                            </p>
                        </div>

                        {/* Sample conversation */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                会話サンプル
                            </p>
                            <div className="space-y-2">
                                <div className="rounded-xl bg-card border border-border p-3">
                                    <p className="text-[10px] text-rose-400 font-semibold mb-1">
                                        相手のAI
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        最近どんな映画を観ましたか？
                                    </p>
                                </div>
                                <div className="rounded-xl bg-tp-accent/15 p-3 ml-6">
                                    <p className="text-[10px] text-tp-accent font-semibold mb-1">
                                        あなたのAI
                                    </p>
                                    <p className="text-xs text-foreground">
                                        {sliders.sharpness > 60
                                            ? "映画？最近は「オッペンハイマー」ですね。正直、世間の評価ほどではなかったけど、映像表現は一見の価値ありです。"
                                            : sliders.boldness > 60
                                                ? "実は先週3本も観ちゃいました！一番のおすすめは「デューン」です。一緒に観に行きませんか？"
                                                : sliders.initiative < 35
                                                    ? "最近だと…「デューン」を観ました。もしお好きなジャンルがあれば、ぜひ教えてください。"
                                                    : "「デューン」を観ました！SF好きなんです。映像美がすごくて感動しました。お好きなジャンルはありますか？"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* NG Keywords Preview */}
                        {ngKeywords.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    回避トピック
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {ngKeywords.map((kw) => (
                                        <span
                                            key={kw}
                                            className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium"
                                        >
                                            🚫 {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
