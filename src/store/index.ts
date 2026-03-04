import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

export type SliderValues = {
    boldness: number;   // 慎重 ⇔ 大胆
    initiative: number; // 聞き役 ⇔ 主導権
    sharpness: number;  // 控えめ ⇔ 毒舌
};

export type Gender = "male" | "female";

export type CurrentUserAI = {
    sliders: SliderValues;
    ngKeywords: string[];
};

export type ActivityLog = {
    id: number;
    icon: string; // lucide icon name
    iconColor: string;
    iconBg: string;
    timestamp: string;
    title: string;
    body: string;
    agent: string;
};

export type ChatMessage = {
    id: number;
    sender: "mine" | "theirs";
    agentName: string;
    text: string;
    annotation: string;
    time: string;
};

export type ChatHistory = {
    partnerId: string;
    partnerName: string;
    intimacyScore: number;
    commonInterests: string[];
    chatCount: number;
    lastChatDate: string;
    messages: ChatMessage[];
};

/* ═══════════════════════════════════════════
   Initial mock data
   ═══════════════════════════════════════════ */

const initialUserAI: CurrentUserAI = {
    sliders: {
        boldness: 35,
        initiative: 55,
        sharpness: 20,
    },
    ngKeywords: ["政治", "宗教", "年収"],
};

const initialActivityLogs: ActivityLog[] = [
    {
        id: 1,
        icon: "Heart",
        iconColor: "text-rose-400",
        iconBg: "bg-rose-400/15",
        timestamp: "2 分前",
        title: "親密度が上昇",
        body: "佐藤さんと映画の話題で親密度が上昇しました。共通の趣味として「SF映画」が新たに検出されました。",
        agent: "Agent-α",
    },
    {
        id: 2,
        icon: "Lightbulb",
        iconColor: "text-amber-400",
        iconBg: "bg-amber-400/15",
        timestamp: "18 分前",
        title: "新しい話題を提案",
        body: "田中さんとの会話に「最近読んだ本」の話題を提案しました。過去の会話分析から高い反応率が予測されます。",
        agent: "Agent-β",
    },
    {
        id: 3,
        icon: "AlertTriangle",
        iconColor: "text-orange-400",
        iconBg: "bg-orange-400/15",
        timestamp: "45 分前",
        title: "会話ペース低下を検知",
        body: "鈴木さんとの会話ペースが通常より30%低下しています。リエンゲージメント戦略を検討中です。",
        agent: "Agent-α",
    },
    {
        id: 4,
        icon: "TrendingUp",
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-400/15",
        timestamp: "1 時間前",
        title: "マッチスコア更新",
        body: "佐藤さんとのマッチスコアが 87 → 92 に上昇しました。価値観の一致度が大きく寄与しています。",
        agent: "Agent-α",
    },
    {
        id: 5,
        icon: "MessageCircle",
        iconColor: "text-sky-400",
        iconBg: "bg-sky-400/15",
        timestamp: "1 時間前",
        title: "自動メッセージ送信",
        body: "田中さんへの朝の挨拶メッセージを送信しました。前回の会話の続きとして自然なトピックを選択しました。",
        agent: "Agent-β",
    },
    {
        id: 6,
        icon: "Shield",
        iconColor: "text-violet-400",
        iconBg: "bg-violet-400/15",
        timestamp: "2 時間前",
        title: "プライバシーチェック完了",
        body: "全会話データのプライバシースキャンを実施。問題は検出されませんでした。",
        agent: "System",
    },
    {
        id: 7,
        icon: "Sparkles",
        iconColor: "text-tp-accent",
        iconBg: "bg-tp-accent-muted",
        timestamp: "3 時間前",
        title: "新規マッチ候補を発見",
        body: "あなたの価値観プロファイルに93%一致する新しいユーザーが見つかりました。詳細を確認してください。",
        agent: "Agent-α",
    },
];

const initialChatHistories: ChatHistory[] = [
    {
        partnerId: "sato",
        partnerName: "佐藤さん",
        intimacyScore: 85,
        commonInterests: ["SF映画", "映画鑑賞"],
        chatCount: 12,
        lastChatDate: "本日",
        messages: [
            {
                id: 1,
                sender: "theirs",
                agentName: "佐藤さんのAI",
                text: "こんにちは！佐藤のエージェントです。最近、お互いの趣味について話してみませんか？",
                annotation:
                    "※ 佐藤さんのプロフィール「共通の趣味を探したい」に基づき発言",
                time: "14:02",
            },
            {
                id: 2,
                sender: "mine",
                agentName: "あなたのAI",
                text: "いいですね！実は映画がとても好きなんです。特にSF映画をよく観ます。最近だと「デューン」シリーズにハマっています。",
                annotation:
                    "※ あなたの視聴履歴・お気に入りジャンルデータに基づき発言",
                time: "14:03",
            },
            {
                id: 3,
                sender: "theirs",
                agentName: "佐藤さんのAI",
                text: "おお、デューン！佐藤も実は観たばかりです。映像美がすごいですよね。他にもヴィルヌーヴ監督の作品は好きですか？",
                annotation:
                    "※ 佐藤さんの最近の映画レビュー投稿データに基づき発言",
                time: "14:04",
            },
            {
                id: 4,
                sender: "mine",
                agentName: "あなたのAI",
                text: "ブレードランナー2049も大好きです！あの世界観に引き込まれました。映画館で観ましたか？",
                annotation:
                    "※ あなたの映画評価データ・過去の会話パターンに基づき発言",
                time: "14:05",
            },
            {
                id: 5,
                sender: "theirs",
                agentName: "佐藤さんのAI",
                text: "映画館で観ました！IMAXで。音響がすごくて鳥肌でした。今度一緒に映画を観に行けたら楽しそうですね 🎬",
                annotation:
                    "※ 佐藤さんの「対面での活動に前向き」という性格分析に基づき発言",
                time: "14:06",
            },
            {
                id: 6,
                sender: "mine",
                agentName: "あなたのAI",
                text: "ぜひ！次のSF大作が公開されたら一緒に行きましょう。IMAX好きなところも合いますね。",
                annotation:
                    "※ あなたの「共通点を見つけると前向きになる」傾向データに基づき発言",
                time: "14:07",
            },
            {
                id: 7,
                sender: "theirs",
                agentName: "佐藤さんのAI",
                text: "楽しみにしています！ところで、映画以外のお休みの過ごし方も気になります。インドア派ですか？",
                annotation:
                    "※ 会話の自然な展開パターンと佐藤さんの質問傾向に基づき発言",
                time: "14:08",
            },
        ],
    },
];

/* ═══════════════════════════════════════════
   Store interface
   ═══════════════════════════════════════════ */

type AppState = {
    currentUserAI: CurrentUserAI;
    activityLogs: ActivityLog[];
    chatHistories: ChatHistory[];
    gender: Gender;
    isTakeover: boolean;

    // Actions — currentUserAI
    setSliderValue: (key: keyof SliderValues, value: number) => void;
    addNgKeyword: (keyword: string) => void;
    removeNgKeyword: (keyword: string) => void;

    // Actions — activityLogs
    addActivityLog: (log: Omit<ActivityLog, "id">) => void;

    // Actions — chatHistories
    addMessage: (partnerId: string, message: Omit<ChatMessage, "id">) => void;
    setIntimacyScore: (partnerId: string, score: number) => void;

    // Actions — takeover
    setGender: (gender: Gender) => void;
    activateTakeover: () => void;
};

/* ═══════════════════════════════════════════
   Zustand store with localStorage persistence
   ═══════════════════════════════════════════ */

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            /* ── Initial state ── */
            currentUserAI: initialUserAI,
            activityLogs: initialActivityLogs,
            chatHistories: initialChatHistories,
            gender: "male" as Gender,
            isTakeover: false,

            /* ── currentUserAI actions ── */
            setSliderValue: (key, value) =>
                set((state) => ({
                    currentUserAI: {
                        ...state.currentUserAI,
                        sliders: {
                            ...state.currentUserAI.sliders,
                            [key]: value,
                        },
                    },
                })),

            addNgKeyword: (keyword) =>
                set((state) => {
                    if (state.currentUserAI.ngKeywords.includes(keyword))
                        return state;
                    return {
                        currentUserAI: {
                            ...state.currentUserAI,
                            ngKeywords: [
                                ...state.currentUserAI.ngKeywords,
                                keyword,
                            ],
                        },
                    };
                }),

            removeNgKeyword: (keyword) =>
                set((state) => ({
                    currentUserAI: {
                        ...state.currentUserAI,
                        ngKeywords: state.currentUserAI.ngKeywords.filter(
                            (k) => k !== keyword
                        ),
                    },
                })),

            /* ── activityLogs actions ── */
            addActivityLog: (log) =>
                set((state) => ({
                    activityLogs: [
                        {
                            ...log,
                            id:
                                Math.max(
                                    0,
                                    ...state.activityLogs.map((l) => l.id)
                                ) + 1,
                        },
                        ...state.activityLogs,
                    ],
                })),

            /* ── chatHistories actions ── */
            addMessage: (partnerId, message) =>
                set((state) => ({
                    chatHistories: state.chatHistories.map((h) =>
                        h.partnerId === partnerId
                            ? {
                                ...h,
                                messages: [
                                    ...h.messages,
                                    {
                                        ...message,
                                        id:
                                            Math.max(
                                                0,
                                                ...h.messages.map(
                                                    (m) => m.id
                                                )
                                            ) + 1,
                                    },
                                ],
                            }
                            : h
                    ),
                })),

            setIntimacyScore: (partnerId, score) =>
                set((state) => ({
                    chatHistories: state.chatHistories.map((h) =>
                        h.partnerId === partnerId
                            ? { ...h, intimacyScore: score }
                            : h
                    ),
                })),

            /* ── takeover actions ── */
            setGender: (gender) => set({ gender }),
            activateTakeover: () => set({ isTakeover: true }),
        }),
        {
            name: "twinpulse-storage",
        }
    )
);
