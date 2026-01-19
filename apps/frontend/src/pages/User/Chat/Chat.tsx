// apps/frontend/src/pages/User/Chat/Chat.tsx
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Chat.css";

import { AuthContext } from "../../../context/AuthContext";
import { useLoginModal } from "../../../context/LoginModalContext";

import { searchUsers } from "../../../api/users.api";
import { getUserChats, createOrGetChat, getChatMessages } from "../../../api/chat.api";
import { getProductById } from "../../../api/products.api";

import { getChatSocket } from "../../../chatSocket";

// ===================== TIPOS =====================
interface UserLite {
  id: number;
  fullName: string;
  profilePicture?: string;
}

interface ChatSummary {
  id: number;
  user1: UserLite;
  user2: UserLite;
  lastMessage?: {
    id: number;
    content: string;
    createdAt: string;
  } | null;
}

interface ChatMessageType {
  id: number;
  content: string;
  createdAt: string;
  sender: UserLite;
}

interface IncomingSocketMessage extends ChatMessageType {
  chatId?: number | string;
  chat?: { id: number | string };
}

// ✅ Producto mínimo para pintar tarjeta
type ProductLite = {
  id: number;
  name: string;
  price: number;
  images?: { image_url: string }[];
};

// ===================== DATE HELPERS (FIX) =====================
// Motivo del bug del "primer chat":
// En algunos entornos el backend devuelve createdAt con formatos distintos por chat:
// - ISO: "2026-01-19T10:22:33.123Z"
// - SQL: "2026-01-19 10:22:33"
// - numérico: "1705650000000" (ms) o "1705650000" (s)
// new Date() puede fallar en uno de esos formatos y el unread queda en 0 SOLO en ese chat.
const toTs = (dateStr?: string | null): number => {
  if (dateStr == null) return 0;

  const s = String(dateStr).trim();
  if (!s) return 0;

  // 0) timestamps numéricos (segundos o milisegundos)
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    if (!Number.isFinite(n)) return 0;
    // si parece segundos (10 dígitos aprox), conviértelo
    if (s.length <= 10) return n * 1000;
    return n;
  }

  // 1) intento directo
  const d1 = new Date(s);
  const t1 = d1.getTime();
  if (Number.isFinite(t1)) return t1;

  // 2) convierte "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
  const fixedT = s.replace(" ", "T");
  const d2 = new Date(fixedT);
  const t2 = d2.getTime();
  if (Number.isFinite(t2)) return t2;

  // 3) fuerza Z (UTC) si sigue sin timezone
  const d3 = new Date(fixedT + "Z");
  const t3 = d3.getTime();
  if (Number.isFinite(t3)) return t3;

  return 0;
};

const toISO = (dateStr?: string | null): string => {
  const ts = toTs(dateStr);
  return ts ? new Date(ts).toISOString() : "";
};

// ===================== API MESSAGE NORMALIZATION (FIX) =====================
// Algunos backends devuelven los mensajes en distintas claves según el chat/paginación:
// - Array directo
// - { data: [...] }
// - { messages: [...] }
// - { chatMessages: [...] }
// Además, los campos pueden venir como createdAt / created_at y sender / user / from.
const extractMessagesArray = (resp: any): any[] => {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.data)) return resp.data;
  if (Array.isArray(resp?.messages)) return resp.messages;
  if (Array.isArray(resp?.chatMessages)) return resp.chatMessages;
  if (Array.isArray(resp?.items)) return resp.items;
  return [];
};

const normalizeMessage = (m: any): ChatMessageType | null => {
  if (!m) return null;

  const id = Number(m.id ?? m.messageId ?? m.msgId);
  const createdAt = String(m.createdAt ?? m.created_at ?? m.timestamp ?? m.sentAt ?? "");
  const content = String(m.content ?? m.text ?? "");

  const senderRaw = m.sender ?? m.user ?? m.from ?? m.author;
  const sender = normalizeUserLite(senderRaw) || { id: 0, fullName: "Usuario" };

  if (!Number.isFinite(id) || !createdAt) return null;

  return { id, content, createdAt, sender };
};


// ===================== HELPERS =====================
const normalizeUserLite = (u: any): UserLite | null => {
  if (!u) return null;
  const id = Number(u.id);
  const fullName = String(u.fullName ?? u.full_name ?? u.name ?? "").trim();
  const profilePicture =
    u.profilePicture ?? u.profile_picture ?? u.avatarUrl ?? u.avatar_url ?? undefined;

  if (!Number.isFinite(id) || !fullName) return null;
  return { id, fullName, profilePicture };
};

const normalizeChatSummary = (c: any): ChatSummary | null => {
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

// ✅ Detecta productId en mensajes (si aparece "/product/123" o "/products/123")
const extractProductIdFromText = (text: string): number | null => {
  if (!text) return null;
  const m = text.match(/\/products?\/(\d+)/i);
  if (!m?.[1]) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
};

// ✅ Saca TODOS los productIds en un texto
const extractAllProductIdsFromText = (text: string): number[] => {
  if (!text) return [];
  const matches = text.matchAll(/\/products?\/(\d+)/gi);
  const ids: number[] = [];
  for (const m of matches) {
    const n = Number(m?.[1]);
    if (Number.isFinite(n) && n > 0) ids.push(n);
  }
  return ids;
};

// ✅ Oferta: extrae importe desde "/offer:123"
const extractOfferAmountFromText = (text: string): number | null => {
  if (!text) return null;
  const m = text.match(/\/offer:(\d+(?:[.,]\d+)?)/i);
  if (!m?.[1]) return null;
  const raw = String(m[1]).replace(",", ".");
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

// ✅ Acción oferta: "/offer_action:accept|reject|counter"
type OfferAction = "accept" | "reject" | "counter";
const extractOfferActionFromText = (text: string): OfferAction | null => {
  if (!text) return null;
  const m = text.match(/\/offer_action:(accept|reject|counter)/i);
  if (!m?.[1]) return null;
  return String(m[1]).toLowerCase() as OfferAction;
};

// ✅ Referencia a la oferta raíz: "/offer_ref:<idMensajeOfertaOriginal>"
const extractOfferRefFromText = (text: string): number | null => {
  if (!text) return null;
  const m = text.match(/\/offer_ref:(\d+)/i);
  if (!m?.[1]) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
};

// ✅ Link de pago: "/paylink:/checkout?productId=1&offer=99"
const extractPayLinkFromText = (text: string): string | null => {
  if (!text) return null;
  const m = text.match(/\/paylink:([^\s]+)/i);
  if (!m?.[1]) return null;
  return String(m[1]).trim();
};

// ✅ Oculta marcadores (producto + oferta + acciones + link)
const stripAllMarkers = (text: string) => {
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

// ✅ Un “nodo de oferta” es:
// - oferta raíz (tiene /offer: y NO tiene /offer_action)
// - o contraoferta (tiene /offer_action:counter y /offer:)
const isOfferNode = (text: string) => {
  const amount = extractOfferAmountFromText(text);
  if (amount === null) return false;
  const action = extractOfferActionFromText(text);
  if (!action) return true; // oferta raíz
  return action === "counter"; // contraoferta es una nueva oferta
};

// ✅ Construir mensajes de acción
const buildOfferActionContent = (args: {
  productId: number;
  offerAmount: number;
  action: OfferAction;
  refOfferMsgId: number; // SIEMPRE referencia al mensaje raíz
}) => {
  const { productId, offerAmount, action, refOfferMsgId } = args;

  let visible = "";
  if (action === "accept") visible = "Oferta aceptada ✅";
  if (action === "reject") visible = "Oferta rechazada ❌";
  if (action === "counter") visible = `Contraoferta: ${offerAmount}€`;

  const base = `${visible} /product/${productId} /offer:${offerAmount} /offer_action:${action} /offer_ref:${refOfferMsgId}`;

  if (action === "accept") {
    const paylink = `/checkout?productId=${productId}&offer=${offerAmount}`;
    return `${base} /paylink:${paylink}`;
  }

  return base;
};

// ===================== ORDENAR CHATS POR ÚLTIMO MENSAJE =====================
const getChatLastTs = (c: ChatSummary) => {
  const d = c.lastMessage?.createdAt;
  const t = toTs(d);
  return Number.isFinite(t) ? t : 0;
};

const sortChatsByLastMessageDesc = (arr: ChatSummary[]) => {
  const copy = [...arr];
  copy.sort((a, b) => {
    const tb = getChatLastTs(b);
    const ta = getChatLastTs(a);
    if (tb !== ta) return tb - ta;
    // fallback estable por id
    return Number(b.id) - Number(a.id);
  });
  return copy;
};

// ===================== UNREAD (WHATSAPP DOT) =====================
const LS_LAST_SEEN_KEY = "nebripop_chat_last_seen_v1";
type LastSeenMap = Record<number, string>; // chatId -> ISO date

const loadLastSeenMap = (): LastSeenMap => {
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

const saveLastSeenMap = (map: LastSeenMap) => {
  try {
    localStorage.setItem(LS_LAST_SEEN_KEY, JSON.stringify(map));
  } catch {
    // noop
  }
};

const getLastSeenISO = (chatId: number): string => {
  const map = loadLastSeenMap();
  return map[chatId] || "";
};

const setLastSeenISO = (chatId: number, iso: string) => {
  const map = loadLastSeenMap();
  map[chatId] = iso;
  saveLastSeenMap(map);
};

// Pool sencillo para no petar el backend si tienes muchos chats
const asyncPool = async <T, R>(
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

export default function ChatPage() {
  const { user, token } = useContext(AuthContext);
  const { openLogin } = useLoginModal();
  const navigate = useNavigate();

  const myId = Number((user as any)?.id);

  // ---------- STATE ----------
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserLite[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [confirmUser, setConfirmUser] = useState<UserLite | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);

  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // ✅ lista de productos mencionados en el chat (último primero)
  const [chatProducts, setChatProducts] = useState<ProductLite[]>([]);
  const [chatProductsLoading, setChatProductsLoading] = useState(false);

  // ✅ caché local
  const productsCacheRef = useRef<Map<number, ProductLite>>(new Map());

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const el = messagesContainerRef.current;
    if (el) {
      if (behavior === "smooth") {
        el.scrollTo({ top: el.scrollHeight, behavior });
      } else {
        el.scrollTop = el.scrollHeight;
      }
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior });
  };

  // ✅ UNREAD COUNTS (puntito whatsapp)
  const [unreadByChat, setUnreadByChat] = useState<Record<number, number>>({});

  // ---------- FORMATOS ----------
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(toTs(dateStr));
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === yesterday.toDateString()) return "Ayer";
    return date.toLocaleDateString("es-ES");
  };

  const formatTime = (dateStr: string) => {
    return new Date(toTs(dateStr)).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (value: number) => {
    const v = Number(value);
    if (Number.isInteger(v)) return `${v}€`;
    return `${v.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}€`;
  };

  // ---------- AUTO-SCROLL ----------
  // 1) Cuando entramos a un chat y terminan de cargarse los mensajes: salto directo al final
  useLayoutEffect(() => {
    if (!selectedChat) return;
    if (loadingMessages) return;
    // Espera a que el DOM pinte el listado agrupado
    requestAnimationFrame(() => scrollToBottom("auto"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id, loadingMessages]);

  // 2) Cuando llegan nuevos mensajes (socket o envío): scroll suave al final
  useEffect(() => {
    if (!selectedChat) return;
    scrollToBottom("smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);
// ===================== Calcular unread real de 1 chat (robusto) =====================
  const computeUnreadForChat = async (chatId: number) => {
    const lastSeenISO = getLastSeenISO(chatId);
    const lastSeenTs = toTs(lastSeenISO);

    try {
      const msgsResp = await getChatMessages(chatId);
      const msgsRaw = extractMessagesArray(msgsResp);

      const msgs: ChatMessageType[] = msgsRaw.map(normalizeMessage).filter(Boolean) as ChatMessageType[];

      const unread = msgs.reduce((acc, m) => {
        const ts = toTs(m.createdAt);
        const fromOther = Number(m.sender.id) !== myId;
        if (fromOther && ts > lastSeenTs) return acc + 1;
        return acc;
      }, 0);

      return Number.isFinite(unread) ? unread : 0;
    } catch {
      return 0;
    }
  };

  // ===================== Cargar chats =====================
  useEffect(() => {
    if (!user || !token || !Number.isFinite(myId)) return;

    // FIX: evita cualquier "auto-leído" por un selectedChat residual
    // (por ejemplo si React reutiliza estado en navegación).
    setSelectedChat(null);

    const fetchChats = async () => {
      try {
        setLoadingChats(true);

        const data = await getUserChats();

        const raw =
          Array.isArray(data)
            ? data
            : Array.isArray((data as any)?.chats)
            ? (data as any).chats
            : Array.isArray((data as any)?.data)
            ? (data as any).data
            : [];

        const safe = raw.map(normalizeChatSummary).filter(Boolean) as ChatSummary[];

        const ordered = sortChatsByLastMessageDesc(safe);
        setChats(ordered);

        // ✅ Inicializa TODOS a 0 para que NINGUNO (incluido el primero) quede undefined
        setUnreadByChat((prev) => {
          const next = { ...prev };
          for (const c of ordered) {
            if (next[c.id] == null) next[c.id] = 0;
          }
          return next;
        });

        // ✅ Calcular no-leídos reales comparando con lastSeen
        const results = await asyncPool(4, ordered, async (c) => {
          const unread = await computeUnreadForChat(c.id);
          return { chatId: c.id, unread };
        });

        // ✅ Merge (NO reemplazar) para evitar pisados
        setUnreadByChat((prev) => {
          const next = { ...prev };
          for (const r of results) next[r.chatId] = r.unread;
          return next;
        });
      } catch (err) {
        console.error("fetchChats error:", err);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, myId]);

  // ===================== Buscar usuarios =====================
  useEffect(() => {
    if (!user || !token || !Number.isFinite(myId)) return;

    const delay = setTimeout(async () => {
      const q = searchTerm.trim();

      if (q.length < 2) {
        setSearchResults([]);
        setSearchLoading(false);
        setConfirmUser(null);
        return;
      }

      try {
        setSearchLoading(true);
        const res = await searchUsers(q);

        const raw =
          Array.isArray(res)
            ? res
            : Array.isArray((res as any)?.users)
            ? (res as any).users
            : Array.isArray((res as any)?.data)
            ? (res as any).data
            : Array.isArray((res as any)?.results)
            ? (res as any).results
            : [];

        const normalized = raw.map(normalizeUserLite).filter(Boolean) as UserLite[];

        const seen = new Set<number>();
        const finalList: UserLite[] = [];
        for (const u of normalized) {
          if (u.id === myId) continue;
          if (seen.has(u.id)) continue;
          seen.add(u.id);
          finalList.push(u);
        }

        setSearchResults(finalList);
      } catch (err) {
        console.error("searchUsers error:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(delay);
  }, [searchTerm, token, user, myId]);

  // ===================== getOtherUser (FIX) =====================
  const getOtherUser = (chat: ChatSummary): UserLite => {
    if (!chat?.user1 || !chat?.user2) return { id: 0, fullName: "Usuario desconocido" };
    return chat.user1.id === myId ? chat.user2 : chat.user1;
  };

  // ===================== Resolver productos del chat =====================
  const resolveChatProductsFromMessages = async (msgs: ChatMessageType[]) => {
    const orderedIds: number[] = [];
    const seen = new Set<number>();

    for (let i = msgs.length - 1; i >= 0; i--) {
      const ids = extractAllProductIdsFromText(msgs[i].content);
      for (const id of ids) {
        if (!seen.has(id)) {
          seen.add(id);
          orderedIds.push(id);
        }
      }
    }

    if (orderedIds.length === 0) {
      setChatProducts([]);
      return;
    }

    try {
      setChatProductsLoading(true);
      const results: ProductLite[] = [];

      for (const id of orderedIds) {
        const cached = productsCacheRef.current.get(id);
        if (cached) {
          results.push(cached);
          continue;
        }

        const p: any = await getProductById(String(id));

        const lite: ProductLite = {
          id: Number(p.id),
          name: String(p.name ?? "Producto"),
          price: Number(p.price ?? 0),
          images: p.images ?? [],
        };

        productsCacheRef.current.set(id, lite);
        results.push(lite);
      }

      setChatProducts(results);
    } catch (e) {
      console.error("No pude cargar productos del chat:", e);
      setChatProducts([]);
    } finally {
      setChatProductsLoading(false);
    }
  };

  const bumpProductToFront = async (productId: number) => {
    setChatProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === productId);
      if (idx === -1) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      return [item, ...copy];
    });

    const exists = chatProducts.some((p) => p.id === productId);
    if (exists) return;

    try {
      setChatProductsLoading(true);

      const cached = productsCacheRef.current.get(productId);
      if (cached) {
        setChatProducts((prev) => [cached, ...prev.filter((p) => p.id !== productId)]);
        return;
      }

      const p: any = await getProductById(String(productId));
      const lite: ProductLite = {
        id: Number(p.id),
        name: String(p.name ?? "Producto"),
        price: Number(p.price ?? 0),
        images: p.images ?? [],
      };

      productsCacheRef.current.set(productId, lite);
      setChatProducts((prev) => [lite, ...prev.filter((x) => x.id !== productId)]);
    } catch (e) {
      console.error("No pude cargar el producto nuevo del chat:", e);
    } finally {
      setChatProductsLoading(false);
    }
  };

  // ===================== Actualizar lastMessage + reordenar =====================
  const bumpChatToTopWithLastMessage = (
    chatId: number,
    lastMsg: { id: number; content: string; createdAt: string }
  ) => {
    setChats((prev) => {
      const updated = prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: {
                id: Number(lastMsg.id),
                content: String(lastMsg.content ?? ""),
                createdAt: String(lastMsg.createdAt ?? new Date().toISOString()),
              },
            }
          : c
      );
      return sortChatsByLastMessageDesc(updated);
    });

    setSelectedChat((prev) => {
      if (!prev || prev.id !== chatId) return prev;
      return {
        ...prev,
        lastMessage: {
          id: Number(lastMsg.id),
          content: String(lastMsg.content ?? ""),
          createdAt: String(lastMsg.createdAt ?? new Date().toISOString()),
        },
      };
    });
  };

  // ===================== Seleccionar chat =====================
  const handleSelectChat = async (chat: ChatSummary) => {
    setSelectedChat(chat);
    setMessages([]);
    setChatProducts([]);
    setLoadingMessages(true);

    try {
      const data = await getChatMessages(chat.id);

      const raw = extractMessagesArray(data);

      const safeMsgs: ChatMessageType[] = raw.map(normalizeMessage).filter(Boolean) as ChatMessageType[];

      safeMsgs.sort((a, b) => toTs(a.createdAt) - toTs(b.createdAt));

      setMessages(safeMsgs);
      await resolveChatProductsFromMessages(safeMsgs);

      const last = safeMsgs[safeMsgs.length - 1];
      if (last) {
        bumpChatToTopWithLastMessage(chat.id, {
          id: last.id,
          content: last.content,
          createdAt: last.createdAt,
        });

        // ✅ guardamos ISO normalizado
        setLastSeenISO(chat.id, toISO(last.createdAt) || new Date().toISOString());
      } else {
        setLastSeenISO(chat.id, new Date().toISOString());
      }

      setUnreadByChat((prev) => ({ ...prev, [chat.id]: 0 }));
    } catch (err) {
      console.error("getChatMessages error:", err);
      setMessages([]);
      setChatProducts([]);
    } finally {
      setLoadingMessages(false);
    }

    const socket = getChatSocket();
    socket.emit("join_chat", { chatId: chat.id });
  };

  // ===================== Crear nuevo chat =====================
  const handleConfirmStartChat = async () => {
    if (!confirmUser || !user || !token || creatingChat) return;

    try {
      setCreatingChat(true);

      const chatResp = await createOrGetChat(confirmUser.id);
      const created = normalizeChatSummary(chatResp) || normalizeChatSummary((chatResp as any)?.data);

      const updated = await getUserChats();
      const rawUpdated =
        Array.isArray(updated)
          ? updated
          : Array.isArray((updated as any)?.chats)
          ? (updated as any).chats
          : Array.isArray((updated as any)?.data)
          ? (updated as any).data
          : [];

      const safe = rawUpdated.map(normalizeChatSummary).filter(Boolean) as ChatSummary[];
      setChats(sortChatsByLastMessageDesc(safe));

      if (created?.id) {
        setUnreadByChat((prev) => ({ ...prev, [created.id]: 0 }));
        setLastSeenISO(created.id, new Date().toISOString());
      }

      const chosen =
        (created?.id ? safe.find((c) => c.id === created.id) : null) || (created ? created : null);

      if (chosen) await handleSelectChat(chosen);

      setConfirmUser(null);
      setSearchTerm("");
      setSearchResults([]);
    } catch (err) {
      console.error("Error creando chat:", err);
    } finally {
      setCreatingChat(false);
    }
  };

  // ===================== SOCKET: recibir mensajes =====================
  useEffect(() => {
    const socket = getChatSocket();

    const handler = (raw: IncomingSocketMessage) => {
      const chatIdRaw = raw.chatId ?? raw.chat?.id;
      const chatId = Number(chatIdRaw);
      if (!Number.isFinite(chatId)) return;

      const senderId = Number((raw as any)?.sender?.id ?? raw?.sender?.id);
      const isMine = Number.isFinite(senderId) && senderId === myId;

      if (raw?.id && raw?.createdAt) {
        bumpChatToTopWithLastMessage(chatId, {
          id: Number(raw.id),
          content: String(raw.content ?? ""),
          createdAt: String(raw.createdAt ?? new Date().toISOString()),
        });
      }

      const isOpenChat = selectedChat?.id === chatId;

      if (!isOpenChat && !isMine) {
        setUnreadByChat((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] ?? 0) + 1,
        }));
      }

      if (isOpenChat) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === raw.id)) return prev;

          const safeSender = normalizeUserLite((raw as any).sender) || { id: 0, fullName: "Usuario" };

          const safeMsg: ChatMessageType = {
            id: Number(raw.id),
            content: String(raw.content ?? ""),
            createdAt: String(raw.createdAt ?? new Date().toISOString()),
            sender: safeSender,
          };

          const pid = extractProductIdFromText(safeMsg.content);
          if (pid) bumpProductToFront(pid);

          return [...prev, safeMsg];
        });

        setUnreadByChat((prev) => ({ ...prev, [chatId]: 0 }));
        if (raw?.createdAt) setLastSeenISO(chatId, toISO(String(raw.createdAt)) || new Date().toISOString());
      }
    };

    socket.on("new_message", handler);

    return () => {
      socket.off("new_message", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat, myId]);

  // ===================== Enviar mensaje normal (socket) =====================
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const content = newMessage.trim();
    setNewMessage("");

    try {
      const socket = getChatSocket();

      socket.emit(
        "send_message",
        { chatId: selectedChat.id, senderId: myId, content },
        (ackMsg: IncomingSocketMessage) => {
          if (!ackMsg?.id) return;

          const safeSender =
            normalizeUserLite((ackMsg as any).sender) || {
              id: myId,
              fullName: (user as any)?.fullName ?? "Tú",
            };

          const safeAck: ChatMessageType = {
            id: Number(ackMsg.id),
            content: String(ackMsg.content ?? content),
            createdAt: String(ackMsg.createdAt ?? new Date().toISOString()),
            sender: safeSender,
          };

          setMessages((prev) => (prev.some((m) => m.id === safeAck.id) ? prev : [...prev, safeAck]));

          bumpChatToTopWithLastMessage(selectedChat.id, {
            id: safeAck.id,
            content: safeAck.content,
            createdAt: safeAck.createdAt,
          });

          setLastSeenISO(selectedChat.id, toISO(safeAck.createdAt) || new Date().toISOString());
          setUnreadByChat((prev) => ({ ...prev, [selectedChat.id]: 0 }));
        }
      );
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  // ===================== Enviar acción oferta (socket) =====================
  const sendOfferAction = (payload: {
    productId: number;
    offerAmount: number;
    action: OfferAction;
    refOfferMsgId: number;
  }) => {
    if (!selectedChat) return;

    const content = buildOfferActionContent(payload);
    const socket = getChatSocket();

    socket.emit(
      "send_message",
      { chatId: selectedChat.id, senderId: myId, content },
      (ackMsg: IncomingSocketMessage) => {
        if (!ackMsg?.id) return;

        const safeSender =
          normalizeUserLite((ackMsg as any).sender) || ({ id: myId, fullName: (user as any)?.fullName ?? "Tú" } as UserLite);

        const safeAck: ChatMessageType = {
          id: Number(ackMsg.id),
          content: String(ackMsg.content ?? content),
          createdAt: String(ackMsg.createdAt ?? new Date().toISOString()),
          sender: safeSender,
        };

        setMessages((prev) => (prev.some((m) => m.id === safeAck.id) ? prev : [...prev, safeAck]));

        bumpChatToTopWithLastMessage(selectedChat.id, {
          id: safeAck.id,
          content: safeAck.content,
          createdAt: safeAck.createdAt,
        });

        setLastSeenISO(selectedChat.id, toISO(safeAck.createdAt) || new Date().toISOString());
        setUnreadByChat((prev) => ({ ...prev, [selectedChat.id]: 0 }));
      }
    );
  };

  // ===================== Agrupar mensajes por fecha =====================
  const messagesByDate = useMemo(() => {
    const grouped: Record<string, ChatMessageType[]> = {};
    for (const m of messages) {
      const key = new Date(toTs(m.createdAt)).toDateString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    }
    for (const k of Object.keys(grouped)) {
      grouped[k].sort((a, b) => toTs(a.createdAt) - toTs(b.createdAt));
    }
    return grouped;
  }, [messages]);

  const orderedChats = useMemo(() => sortChatsByLastMessageDesc(chats), [chats]);

  // ===================== Oferta: resolver “hilo” =====================
  type OfferThreadResolved = {
    rootMsg: ChatMessageType;
    lastNode: ChatMessageType;
    terminalAction: "accept" | "reject" | null;
    lastCounter: ChatMessageType | null;
  };

  const resolveOfferThread = (rootMsg: ChatMessageType): OfferThreadResolved => {
    const rootId = rootMsg.id;

    const related = messages
      .filter((m) => extractOfferRefFromText(m.content) === rootId)
      .map((m) => ({
        msg: m,
        action: extractOfferActionFromText(m.content),
        ts: toTs(m.createdAt),
      }))
      .filter((x) => x.action)
      .sort((a, b) => a.ts - b.ts);

    const lastCounter = [...related].reverse().find((x) => x.action === "counter")?.msg ?? null;

    const terminal = (() => {
      const lastTerminal = [...related].reverse().find((x) => x.action === "accept" || x.action === "reject");
      if (!lastTerminal) return null;
      return lastTerminal.action as "accept" | "reject";
    })();

    const lastNode = lastCounter ?? rootMsg;

    return { rootMsg, lastNode, terminalAction: terminal, lastCounter };
  };

  // ===================== UI =====================
  if (!user || !token) {
    return (
      <div className="chat-page">
        <div className="chat-login-required">
          <h3>¿Quieres enviar un mensaje?</h3>
          <p>Inicia sesión para continuar.</p>
          <button className="login-required-btn" onClick={openLogin}>
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  function CounterOfferButton({ onSend }: { onSend: (amount: number) => void }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<number | "">("");

    if (!open) {
      return (
        <button className="chat-offer-btn counter" type="button" onClick={() => setOpen(true)}>
          Contraoferta
        </button>
      );
    }

    return (
      <div className="chat-offer-counter">
        <input
          type="number"
          min="1"
          placeholder="€"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return setValue("");
            const n = Number(v);
            setValue(Number.isFinite(n) ? n : "");
          }}
        />
        <button
          type="button"
          className="chat-offer-btn counter-send"
          onClick={() => {
            const n = typeof value === "number" ? value : NaN;
            if (!Number.isFinite(n) || n <= 0) return;
            onSend(n);
            setOpen(false);
            setValue("");
          }}
        >
          Enviar
        </button>
        <button
          type="button"
          className="chat-offer-btn counter-cancel"
          onClick={() => {
            setOpen(false);
            setValue("");
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  const renderOfferNodeAttachment = (offerNodeMsg: ChatMessageType, rootOfferMsg: ChatMessageType) => {
    const pid = extractProductIdFromText(offerNodeMsg.content);
    if (!pid) return null;

    const offerAmount = extractOfferAmountFromText(offerNodeMsg.content);
    if (offerAmount === null) return null;

    const cached = productsCacheRef.current.get(pid);
    const product = cached ?? chatProducts.find((p) => p.id === pid);

    const img = product?.images?.[0]?.image_url ?? "/no-image.webp";
    const name = product?.name ?? "Producto";
    const originalPrice = product?.price;

    const mineNode = Number(offerNodeMsg.sender.id) === myId;

    const thread = resolveOfferThread(rootOfferMsg);

    const statusLabel =
      thread.terminalAction === "accept"
        ? "Aceptada ✅"
        : thread.terminalAction === "reject"
        ? "Rechazada ❌"
        : thread.lastCounter
        ? "Contraoferta 🔁"
        : null;

    const payLink =
      thread.terminalAction === "accept"
        ? (() => {
            const acceptMsg = messages
              .filter((m) => extractOfferRefFromText(m.content) === rootOfferMsg.id)
              .filter((m) => extractOfferActionFromText(m.content) === "accept")
              .sort((a, b) => toTs(b.createdAt) - toTs(a.createdAt))[0];
            return acceptMsg ? extractPayLinkFromText(acceptMsg.content) : null;
          })()
        : null;

    const isLastActiveNode = thread.lastNode.id === offerNodeMsg.id;
    const canRespond = !thread.terminalAction && isLastActiveNode && !mineNode;

    return (
      <div className="chat-offer-attachment-wrap">
        <Link to={`/product/${pid}`} className="chat-offer-attachment">
          <img className="chat-offer-attachment-img" src={img} alt={name} />
          <div className="chat-offer-attachment-info">
            <div className="chat-offer-attachment-name">{name}</div>

            <div className="chat-offer-attachment-prices">
              <div className="chat-offer-attachment-original">
                <span className="chat-offer-attachment-label">Precio:</span>{" "}
                <span className="chat-offer-attachment-value">
                  {typeof originalPrice === "number" ? formatPrice(originalPrice) : "—"}
                </span>
              </div>

              <div className="chat-offer-attachment-offer">
                <span className="chat-offer-attachment-label">Oferta:</span>{" "}
                <span className="chat-offer-attachment-value">{formatPrice(offerAmount)}</span>
              </div>

              {statusLabel && (
                <div className="chat-offer-attachment-status">
                  <span className="chat-offer-attachment-label">Estado:</span>{" "}
                  <span className="chat-offer-attachment-value">{statusLabel}</span>
                </div>
              )}
            </div>
          </div>
        </Link>

        {canRespond && (
          <div className="chat-offer-actions">
            <button
              className="chat-offer-btn accept"
              type="button"
              onClick={() =>
                sendOfferAction({
                  productId: pid,
                  offerAmount,
                  action: "accept",
                  refOfferMsgId: rootOfferMsg.id,
                })
              }
            >
              Aceptar
            </button>

            <button
              className="chat-offer-btn reject"
              type="button"
              onClick={() =>
                sendOfferAction({
                  productId: pid,
                  offerAmount,
                  action: "reject",
                  refOfferMsgId: rootOfferMsg.id,
                })
              }
            >
              Rechazar
            </button>

            <CounterOfferButton
              onSend={(counter) =>
                sendOfferAction({
                  productId: pid,
                  offerAmount: counter,
                  action: "counter",
                  refOfferMsgId: rootOfferMsg.id,
                })
              }
            />
          </div>
        )}

        {thread.terminalAction === "accept" && payLink && (
          <div className="chat-offer-pay">
            <button className="chat-offer-btn buy" type="button" onClick={() => navigate(payLink)}>
              Comprar
            </button>
          </div>
        )}
      </div>
    );
  };

  // ===================== RETURN =====================
  return (
    <div className="chat-page">
      <div className="chat-layout">
        {/* SIDEBAR */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3>Buzón</h3>
          </div>

          {/* Buscar usuario */}
          <div className="chat-search-box">
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {searchLoading && (
            <div className="chat-small-text" style={{ marginTop: 8 }}>
              Buscando...
            </div>
          )}

          {!searchLoading && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
            <div className="chat-small-text" style={{ marginTop: 8 }}>
              No se encontraron usuarios
            </div>
          )}

          {!searchLoading && searchResults.length > 0 && (
            <div className="chat-search-results">
              {searchResults.map((u) => (
                <div key={u.id} className="chat-user-item" onClick={() => setConfirmUser(u)}>
                  <div className="avatar-circle">
                    {u.profilePicture ? <img src={u.profilePicture} className="avatar-img" /> : u.fullName.charAt(0).toUpperCase()}
                  </div>

                  <div className="chat-user-texts">
                    <span className="chat-user-name">{u.fullName}</span>
                    <span className="chat-user-sub">Pulsa para iniciar chat</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {confirmUser && (
            <div className="chat-confirm-box">
              <p>
                ¿Iniciar conversación con <b>{confirmUser.fullName}</b>?
              </p>
              <div className="chat-confirm-buttons">
                <button onClick={handleConfirmStartChat} disabled={creatingChat}>
                  {creatingChat ? "Creando..." : "Sí"}
                </button>
                <button onClick={() => setConfirmUser(null)} disabled={creatingChat}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="chat-sidebar-divider" />

          {/* Lista de chats */}
          <div className="chat-sidebar-chats">
            {loadingChats ? (
              <div className="chat-small-text">Cargando chats...</div>
            ) : (
              orderedChats.map((c) => {
                const other = getOtherUser(c);

                const preview = c.lastMessage?.content ? stripAllMarkers(c.lastMessage.content) : "Sin mensajes";
                const unread = unreadByChat[c.id] ?? 0;

                return (
                  <div
                    key={c.id}
                    className={`chat-user-item ${selectedChat?.id === c.id ? "active" : ""}`}
                    onClick={() => handleSelectChat(c)}
                  >
                    <div className="avatar-circle">
                      {other.profilePicture ? <img src={other.profilePicture} className="avatar-img" /> : other.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div className="chat-user-texts">
                      <span className="chat-user-name">{other.fullName}</span>
                      <span className="chat-user-sub">{preview.length > 26 ? preview.slice(0, 26) + "..." : preview}</span>
                    </div>

                    {/* ✅ Puntito tipo WhatsApp */}
                    <div className="chat-user-meta">
                      {unread > 0 && <span className="chat-unread-badge">{unread > 99 ? "99+" : unread}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT PRINCIPAL */}
        <div className="chat-main">
          {!selectedChat ? (
            <div className="chat-empty">Selecciona un chat o inicia uno nuevo</div>
          ) : (
            <>
              <div className="chat-main-header">
                <div className="chat-header-user">
                  {getOtherUser(selectedChat).profilePicture ? (
                    <img
                      src={getOtherUser(selectedChat).profilePicture!}
                      className="chat-header-avatar"
                      alt="avatar"
                    />
                  ) : (
                    <div className="avatar-circle small">{getOtherUser(selectedChat).fullName.charAt(0)}</div>
                  )}
                  <h3>{getOtherUser(selectedChat).fullName}</h3>
                </div>
              </div>

              {/* CARRUSEL PRODUCTOS */}
              {chatProductsLoading && (
                <div className="chat-products-strip" style={{ opacity: 0.8 }}>
                  <div className="chat-products-loading">Cargando productos...</div>
                </div>
              )}

              {!chatProductsLoading && chatProducts.length > 0 && (
                <div className="chat-products-strip">
                  {chatProducts.map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} className="chat-product-pill">
                      <img
                        src={p.images?.[0]?.image_url ?? "/no-image.webp"}
                        className="chat-product-pill-img"
                        alt={p.name}
                      />
                      <div className="chat-product-pill-info">
                        <div className="chat-product-pill-name">{p.name}</div>
                        <div className="chat-product-pill-price">{formatPrice(p.price)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Mensajes */}
              <div className="chat-messages" ref={messagesContainerRef}>
                {loadingMessages ? (
                  <div className="chat-empty">Cargando mensajes...</div>
                ) : (
                  Object.entries(messagesByDate).map(([dateKey, msgs]) => (
                    <div key={dateKey}>
                      <div className="date-divider">{formatDateLabel(msgs[0].createdAt)}</div>

                      {msgs.map((msg) => {
                        const mine = Number(msg.sender.id) === myId;

                        let offerCard: React.ReactNode = null;

                        if (isOfferNode(msg.content)) {
                          const action = extractOfferActionFromText(msg.content);
                          const isCounter = action === "counter";

                          if (!isCounter) {
                            offerCard = renderOfferNodeAttachment(msg, msg);
                          } else {
                            const rootId = extractOfferRefFromText(msg.content);
                            const rootMsg = rootId != null ? messages.find((m) => m.id === rootId) : null;

                            if (rootMsg && isOfferNode(rootMsg.content)) {
                              offerCard = renderOfferNodeAttachment(msg, rootMsg);
                            } else {
                              offerCard = renderOfferNodeAttachment(msg, msg);
                            }
                          }
                        }

                        return (
                          <div key={msg.id} className={mine ? "message own-message" : "message"}>
                            {offerCard}
                            <div className="message-text">{stripAllMarkers(msg.content)}</div>
                            <div className="message-time">{formatTime(msg.createdAt)}</div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="chat-input-box">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>Enviar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
