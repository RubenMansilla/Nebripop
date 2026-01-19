// apps/frontend/src/pages/User/Chat/ChatHelpers.ts

// ===================== TIPOS E INTERFACES =====================

export interface UserLite {
    id: number;
    fullName: string;
    profilePicture?: string;
}

export interface ChatSummary {
    id: number;
    user1: UserLite;
    user2: UserLite;
    lastMessage?: {
        id: number;
        content: string;
        createdAt: string;
    } | null;
}

export interface ChatMessageType {
    id: number;
    content: string;
    createdAt: string;
    sender: UserLite;
}

export interface IncomingSocketMessage extends ChatMessageType {
    chatId?: number | string;
    chat?: { id: number | string };
}

// ✅ Producto mínimo para pintar tarjeta
export type ProductLite = {
    id: number;
    name: string;
    price: number;
    images?: { image_url: string }[];
};

export type OfferAction = "accept" | "reject" | "counter";

// ===================== DATE HELPERS =====================

export const toTs = (dateStr?: string | null): number => {
    if (dateStr == null) return 0;

    const s = String(dateStr).trim();
    if (!s) return 0;

    // 0) timestamps numéricos
    if (/^\d+$/.test(s)) {
        const n = Number(s);
        if (!Number.isFinite(n)) return 0;
        if (s.length <= 10) return n * 1000;
        return n;
    }

    // 1) intento directo
    const d1 = new Date(s);
    const t1 = d1.getTime();
    if (Number.isFinite(t1)) return t1;

    // 2) arreglar formato SQL
    const fixedT = s.replace(" ", "T");
    const d2 = new Date(fixedT);
    const t2 = d2.getTime();
    if (Number.isFinite(t2)) return t2;

    // 3) fuerza Z (UTC)
    const d3 = new Date(fixedT + "Z");
    const t3 = d3.getTime();
    if (Number.isFinite(t3)) return t3;

    return 0;
};

export const toISO = (dateStr?: string | null): string => {
    const ts = toTs(dateStr);
    return ts ? new Date(ts).toISOString() : "";
};

// ===================== NORMALIZADORES DE DATOS =====================

export const normalizeUserLite = (u: any): UserLite | null => {
    if (!u) return null;
    const id = Number(u.id);
    const fullName = String(u.fullName ?? u.full_name ?? u.name ?? "").trim();
    const profilePicture =
        u.profilePicture ?? u.profile_picture ?? u.avatarUrl ?? u.avatar_url ?? undefined;

    if (!Number.isFinite(id) || !fullName) return null;
    return { id, fullName, profilePicture };
};

export const normalizeMessage = (m: any): ChatMessageType | null => {
    if (!m) return null;

    const id = Number(m.id ?? m.messageId ?? m.msgId);
    const createdAt = String(m.createdAt ?? m.created_at ?? m.timestamp ?? m.sentAt ?? "");
    const content = String(m.content ?? m.text ?? "");

    const senderRaw = m.sender ?? m.user ?? m.from ?? m.author;
    const sender = normalizeUserLite(senderRaw) || { id: 0, fullName: "Usuario" };

    if (!Number.isFinite(id) || !createdAt) return null;

    return { id, content, createdAt, sender };
};

export const normalizeChatSummary = (c: any): ChatSummary | null => {
    if (!c) return null;
    const id = Number(c.id);
    if (!Number.isFinite(id)) return null;

    const user1 = normalizeUserLite(c.user1);
    const user2 = normalizeUserLite(c.user2);
    if (!user1 || !user2) return null;

    const lm = c.lastMessage;
    const lastMessage =
        lm && typeof lm === "object"
            ? {
                id: Number(lm.id),
                content: String(lm.content ?? ""),
                createdAt: String(lm.createdAt ?? ""),
            }
            : null;

    return { id, user1, user2, lastMessage };
};

export const extractMessagesArray = (resp: any): any[] => {
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp?.data)) return resp.data;
    if (Array.isArray(resp?.messages)) return resp.messages;
    if (Array.isArray(resp?.chatMessages)) return resp.chatMessages;
    if (Array.isArray(resp?.items)) return resp.items;
    return [];
};

// ===================== EXTRACTION HELPERS (REGEX) =====================

// Detecta productId en mensajes
export const extractProductIdFromText = (text: string): number | null => {
    if (!text) return null;
    const m = text.match(/\/products?\/(\d+)/i);
    if (!m?.[1]) return null;
    const n = Number(m[1]);
    return Number.isFinite(n) && n > 0 ? n : null;
};

// Saca TODOS los productIds en un texto
export const extractAllProductIdsFromText = (text: string): number[] => {
    if (!text) return [];
    const matches = text.matchAll(/\/products?\/(\d+)/gi);
    const ids: number[] = [];
    for (const m of matches) {
        const n = Number(m?.[1]);
        if (Number.isFinite(n) && n > 0) ids.push(n);
    }
    return ids;
};

// Oferta: extrae importe
export const extractOfferAmountFromText = (text: string): number | null => {
    if (!text) return null;
    const m = text.match(/\/offer:(\d+(?:[.,]\d+)?)/i);
    if (!m?.[1]) return null;
    const raw = String(m[1]).replace(",", ".");
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
};

// Acción oferta
export const extractOfferActionFromText = (text: string): OfferAction | null => {
    if (!text) return null;
    const m = text.match(/\/offer_action:(accept|reject|counter)/i);
    if (!m?.[1]) return null;
    return String(m[1]).toLowerCase() as OfferAction;
};

// Referencia a la oferta raíz
export const extractOfferRefFromText = (text: string): number | null => {
    if (!text) return null;
    const m = text.match(/\/offer_ref:(\d+)/i);
    if (!m?.[1]) return null;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : null;
};

// Link de pago
export const extractPayLinkFromText = (text: string): string | null => {
    if (!text) return null;
    const m = text.match(/\/paylink:([^\s]+)/i);
    if (!m?.[1]) return null;
    return String(m[1]).trim();
};

// Oculta marcadores
export const stripAllMarkers = (text: string) => {
    if (!text) return "";
    return text
        .replace(/\s*\/products?\/\d+\s*/gi, " ")
        .replace(/\s*\/offer:\d+(?:[.,]\d+)?\s*/gi, " ")
        .replace(/\s*\/offer_action:(accept|reject|counter)\s*/gi, " ")
        .replace(/\s*\/offer_ref:\d+\s*/gi, " ")
        .replace(/\s*\/paylink:[^\s]+\s*/gi, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
};

// Detecta si es un nodo de oferta
export const isOfferNode = (text: string) => {
    const amount = extractOfferAmountFromText(text);
    if (amount === null) return false;
    const action = extractOfferActionFromText(text);
    if (!action) return true; // oferta raíz
    return action === "counter"; // contraoferta es una nueva oferta
};

// Construir contenido de acción de oferta
export const buildOfferActionContent = (args: {
    productId: number;
    offerAmount: number;
    action: OfferAction;
    refOfferMsgId: number;
}) => {
    const { productId, offerAmount, action, refOfferMsgId } = args;

    let visible = "";
    if (action === "accept") visible = "Oferta aceptada";
    if (action === "reject") visible = "Oferta rechazada";
    if (action === "counter") visible = `Contraoferta: ${offerAmount}€`;

    const base = `${visible} /product/${productId} /offer:${offerAmount} /offer_action:${action} /offer_ref:${refOfferMsgId}`;

    if (action === "accept") {
        const paylink = `/checkout?productId=${productId}&offer=${offerAmount}`;
        return `${base} /paylink:${paylink}`;
    }

    return base;
};

// ===================== ORDENAMIENTO DE CHATS =====================

export const getChatLastTs = (c: ChatSummary) => {
    const d = c.lastMessage?.createdAt;
    const t = toTs(d);
    return Number.isFinite(t) ? t : 0;
};

export const sortChatsByLastMessageDesc = (arr: ChatSummary[]) => {
    const copy = [...arr];
    copy.sort((a, b) => {
        const tb = getChatLastTs(b);
        const ta = getChatLastTs(a);
        if (tb !== ta) return tb - ta;
        return Number(b.id) - Number(a.id);
    });
    return copy;
};

// ===================== LOCAL STORAGE (UNREAD) =====================

const LS_LAST_SEEN_KEY = "nebripop_chat_last_seen_v1";
type LastSeenMap = Record<number, string>;

export const loadLastSeenMap = (): LastSeenMap => {
    try {
        const raw = localStorage.getItem(LS_LAST_SEEN_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return {};
        const out: LastSeenMap = {};
        for (const [k, v] of Object.entries(parsed)) {
            const chatId = Number(k);
            const iso = String(v ?? "");
            if (Number.isFinite(chatId) && iso) out[chatId] = iso;
        }
        return out;
    } catch {
        return {};
    }
};

export const saveLastSeenMap = (map: LastSeenMap) => {
    try {
        localStorage.setItem(LS_LAST_SEEN_KEY, JSON.stringify(map));
    } catch {
        // noop
    }
};

export const getLastSeenISO = (chatId: number): string => {
    const map = loadLastSeenMap();
    return map[chatId] || "";
};

export const setLastSeenISO = (chatId: number, iso: string) => {
    const map = loadLastSeenMap();
    map[chatId] = iso;
    saveLastSeenMap(map);
};

// ===================== UTILS =====================

export const asyncPool = async <T, R>(
    poolLimit: number,
    array: T[],
    iteratorFn: (item: T) => Promise<R>
): Promise<R[]> => {
    const ret: Promise<R>[] = [];
    const executing: Promise<any>[] = [];

    for (const item of array) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);

        const e = p.finally(() => {
            const idx = executing.indexOf(e);
            if (idx >= 0) executing.splice(idx, 1);
        });
        executing.push(e);

        if (executing.length >= poolLimit) {
            await Promise.race(executing);
        }
    }

    return Promise.all(ret);
};