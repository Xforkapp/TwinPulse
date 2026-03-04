"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore, type ActivityLog, type ChatMessage } from "@/store";

/* ═══════════════════════════════════════════
   Mock event pool — Activity Timeline
   ═══════════════════════════════════════════ */

const activityPool: Omit<ActivityLog, "id" | "timestamp">[] = [
    {
        icon: "Heart",
        iconColor: "text-rose-400",
        iconBg: "bg-rose-400/15",
        title: "共通の価値観を検出",
        body: "佐藤さんとの間で「家族を大切にする」という価値観の一致が新たに確認されました。",
        agent: "Agent-α",
    },
    {
        icon: "Lightbulb",
        iconColor: "text-amber-400",
        iconBg: "bg-amber-400/15",
        title: "会話トピック最適化",
        body: "田中さんとの次回の会話に「旅行の思い出」を提案。過去の反応パターンから高い興味が予測されます。",
        agent: "Agent-β",
    },
    {
        icon: "TrendingUp",
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-400/15",
        title: "エンゲージメント上昇中",
        body: "鈴木さんとの会話頻度が先週比で42%増加。関係性が良好に進展しています。",
        agent: "Agent-α",
    },
    {
        icon: "MessageCircle",
        iconColor: "text-sky-400",
        iconBg: "bg-sky-400/15",
        title: "フォローアップ送信",
        body: "佐藤さんへ昨日の映画の感想を共有するメッセージを送信しました。",
        agent: "Agent-α",
    },
    {
        icon: "Shield",
        iconColor: "text-violet-400",
        iconBg: "bg-violet-400/15",
        title: "セキュリティスキャン完了",
        body: "直近24時間の会話データに対するプライバシーチェックが正常に完了しました。",
        agent: "System",
    },
    {
        icon: "Sparkles",
        iconColor: "text-tp-accent",
        iconBg: "bg-tp-accent-muted",
        title: "新規マッチ候補発見",
        body: "価値観の一致率89%の新しいユーザーを発見しました。レコメンデーションに追加します。",
        agent: "Agent-α",
    },
    {
        icon: "AlertTriangle",
        iconColor: "text-orange-400",
        iconBg: "bg-orange-400/15",
        title: "応答遅延を検知",
        body: "田中さんからの返信が通常より遅れています。メッセージトーンの調整を検討中です。",
        agent: "Agent-β",
    },
    {
        icon: "Heart",
        iconColor: "text-rose-400",
        iconBg: "bg-rose-400/15",
        title: "感情分析レポート",
        body: "直近の会話から佐藤さんのポジティブ反応率が92%と非常に高い数値を記録しました。",
        agent: "Agent-α",
    },
    {
        icon: "TrendingUp",
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-400/15",
        title: "マッチスコア再計算",
        body: "最新データに基づきスコアを再計算中… 佐藤さんとの相性スコアが3ポイント上昇しました。",
        agent: "System",
    },
    {
        icon: "Lightbulb",
        iconColor: "text-amber-400",
        iconBg: "bg-amber-400/15",
        title: "パーソナリティ学習更新",
        body: "あなたの会話履歴から「ユーモアを交えた会話」への好みを新たに学習しました。",
        agent: "System",
    },
    {
        icon: "MessageCircle",
        iconColor: "text-sky-400",
        iconBg: "bg-sky-400/15",
        title: "新規エージェントと接触中",
        body: "山田さんのAIエージェントからコンタクトリクエストを受信。初回会話の準備を行っています。",
        agent: "Agent-β",
    },
    {
        icon: "Sparkles",
        iconColor: "text-tp-accent",
        iconBg: "bg-tp-accent-muted",
        title: "週間レポート生成",
        body: "今週のマッチング活動レポートが完成しました。全体的なエンゲージメントは良好です。",
        agent: "System",
    },
];

/* ═══════════════════════════════════════════
   Mock conversation pool — Chat progression
   ═══════════════════════════════════════════ */

type MockChatPair = {
    theirText: string;
    theirAnnotation: string;
    mineText: string;
    mineAnnotation: string;
};

const chatPool: MockChatPair[] = [
    {
        theirText: "そういえば、音楽は聴きますか？最近ハマっているアーティストとかいます？ 🎵",
        theirAnnotation: "※ 佐藤さんの「趣味を広く探りたい」という性格分析に基づき発言",
        mineText: "よく聴きます！最近はシティポップが好きで、竹内まりやとか聴いてます。佐藤さんは？",
        mineAnnotation: "※ あなたの音楽再生履歴・お気に入りジャンルデータに基づき発言",
    },
    {
        theirText: "シティポップいいですね！佐藤もプラスティック・ラブ大好きです。カフェで働いてるときにBGMで流してます ☕",
        theirAnnotation: "※ 佐藤さんの職業情報と音楽の好みデータに基づき発言",
        mineText: "カフェで働いてるんですか！素敵ですね。おすすめのカフェとかあったら今度教えてください 😊",
        mineAnnotation: "※ あなたの「相手の話題に興味を示す」会話パターンに基づき発言",
    },
    {
        theirText: "ぜひ！渋谷に隠れ家的なカフェがあるんです。今度一緒にどうですか？",
        theirAnnotation: "※ 佐藤さんの「対面での活動に積極的」という傾向データに基づき発言",
        mineText: "行きたいです！渋谷なら仕事帰りにも寄れるので、都合が合えばぜひ。",
        mineAnnotation: "※ あなたの行動圏・スケジュールデータに基づき発言",
    },
    {
        theirText: "ところで、休日は何をして過ごすことが多いですか？インドア派？アウトドア派？",
        theirAnnotation: "※ 会話の自然な展開と佐藤さんのライフスタイル関心度に基づき発言",
        mineText: "基本インドアですが、天気がいい日は散歩も好きです。公園でコーヒー飲みながら読書するのが至福の時間です 📖",
        mineAnnotation: "※ あなたの休日行動パターンと趣味データに基づき発言",
    },
    {
        theirText: "公園で読書！すごく共感します。佐藤も代々木公園でよく本読んでます。好きな作家はいますか？",
        theirAnnotation: "※ 佐藤さんの位置情報履歴と読書嗜好データに基づき発言",
        mineText: "村上春樹が好きです。「ノルウェイの森」が特に。佐藤さんのおすすめがあれば教えてほしいです！",
        mineAnnotation: "※ あなたの読書履歴・レビューデータに基づき発言",
    },
    {
        theirText: "村上春樹！佐藤は「海辺のカフカ」が一番好きです。文学好きが合うのは嬉しいですね 📚",
        theirAnnotation: "※ 佐藤さんの読書レビューと共通点強調パターンに基づき発言",
        mineText: "海辺のカフカも名作ですよね！文学談義できる人がいるのは本当に嬉しいです。",
        mineAnnotation: "※ あなたの「共感を示す」コミュニケーション傾向に基づき発言",
    },
];

/* ═══════════════════════════════════════════
   Utility
   ═══════════════════════════════════════════ */

function randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNow(): string {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

/* ═══════════════════════════════════════════
   Hook: Activity Log Auto-Generation
   15〜30秒ごとにランダムなイベントを追加
   ═══════════════════════════════════════════ */

export function useActivitySimulation() {
    const addActivityLog = useAppStore((s) => s.addActivityLog);
    const poolIndexRef = useRef(0);

    useEffect(() => {
        const scheduleNext = () => {
            const delay = randomBetween(15000, 30000);
            return setTimeout(() => {
                const template =
                    activityPool[poolIndexRef.current % activityPool.length];
                poolIndexRef.current += 1;

                addActivityLog({
                    ...template,
                    timestamp: "たった今",
                });

                timerRef = scheduleNext();
            }, delay);
        };

        let timerRef = scheduleNext();

        return () => clearTimeout(timerRef);
    }, [addActivityLog]);
}

/* ═══════════════════════════════════════════
   Hook: Chat Auto-Progression
   5〜12秒ごとに吹き出しを追加し、親密度も上昇
   ═══════════════════════════════════════════ */

export function useChatSimulation(
    partnerId: string,
    scrollToBottom: () => void
) {
    const addMessage = useAppStore((s) => s.addMessage);
    const setIntimacyScore = useAppStore((s) => s.setIntimacyScore);
    const chatHistories = useAppStore((s) => s.chatHistories);
    const pairIndexRef = useRef(0);
    const stepRef = useRef<"theirs" | "mine">("theirs");

    const chat = chatHistories.find((h) => h.partnerId === partnerId);

    const addNextMessage = useCallback(() => {
        const pair = chatPool[pairIndexRef.current % chatPool.length];
        const time = formatNow();

        if (stepRef.current === "theirs") {
            addMessage(partnerId, {
                sender: "theirs",
                agentName: "佐藤さんのAI",
                text: pair.theirText,
                annotation: pair.theirAnnotation,
                time,
            });
            stepRef.current = "mine";
        } else {
            addMessage(partnerId, {
                sender: "mine",
                agentName: "あなたのAI",
                text: pair.mineText,
                annotation: pair.mineAnnotation,
                time,
            });
            stepRef.current = "theirs";
            pairIndexRef.current += 1;

            // Increase intimacy by 1-3 points, cap at 99
            if (chat) {
                const bump = randomBetween(1, 3);
                const newScore = Math.min(99, chat.intimacyScore + bump);
                setIntimacyScore(partnerId, newScore);
            }
        }

        // Auto-scroll after DOM update
        requestAnimationFrame(() => {
            setTimeout(scrollToBottom, 50);
        });
    }, [partnerId, addMessage, setIntimacyScore, chat, scrollToBottom]);

    useEffect(() => {
        const scheduleNext = () => {
            const delay = randomBetween(5000, 12000);
            return setTimeout(() => {
                addNextMessage();
                timerRef = scheduleNext();
            }, delay);
        };

        let timerRef = scheduleNext();

        return () => clearTimeout(timerRef);
    }, [addNextMessage]);
}
