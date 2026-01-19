import { useContext, useEffect, useMemo, useRef, useState } from "react";
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
  chatId?: number;
  chat?: { id: number };
}

// ✅ Producto mínimo para pintar tarjeta
type ProductLite = {
  id: number;
  name: string;
  price: number;
  images?: { image_url: string }[];
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
  const t = d ? new Date(d).getTime() : 0;
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

  // ---------- FORMATOS ----------
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === yesterday.toDateString()) return "Ayer";
    return date.toLocaleDateString("es-ES");
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("es-ES", {
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
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===================== Cargar chats =====================
  useEffect(() => {
    if (!user || !token) return;

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

        // ✅ ORDENAR POR ÚLTIMO MENSAJE
        setChats(sortChatsByLastMessageDesc(safe));

        setSelectedChat((prev) => {
          if (!prev) return null;
          return safe.some((c) => c.id === prev.id) ? prev : null;
        });
      } catch (err) {
        console.error("fetchChats error:", err);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, [user, token]);

  // ===================== Buscar usuarios =====================
  useEffect(() => {
    if (!user || !token) return;

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
  const bumpChatToTopWithLastMessage = (chatId: number, lastMsg: { id: number; content: string; createdAt: string }) => {
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

    // Si el chat activo es este, también actualizamos selectedChat.lastMessage para que el header/snippet cuadre
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

      const raw =
        Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
          ? (data as any).data
          : [];

      const safeMsgs: ChatMessageType[] = raw
        .filter(Boolean)
        .map((m: any) => ({
          id: Number(m.id),
          content: String(m.content ?? ""),
          createdAt: String(m.createdAt ?? ""),
          sender: normalizeUserLite(m.sender) || { id: 0, fullName: "Usuario" },
        }))
        .filter((m: any) => Number.isFinite(m.id) && m.createdAt);

      safeMsgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      setMessages(safeMsgs);
      await resolveChatProductsFromMessages(safeMsgs);

      // ✅ si el backend no manda lastMessage, lo inferimos de los mensajes cargados
      const last = safeMsgs[safeMsgs.length - 1];
      if (last) {
        bumpChatToTopWithLastMessage(chat.id, { id: last.id, content: last.content, createdAt: last.createdAt });
      }
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
    if (!selectedChat) return;

    const socket = getChatSocket();

    const handler = (raw: IncomingSocketMessage) => {
      const chatId = raw.chatId ?? raw.chat?.id;
      if (!chatId) return;

      // ✅ actualiza lastMessage + reordena lista SIEMPRE que llegue mensaje
      if (raw?.id && raw?.createdAt) {
        bumpChatToTopWithLastMessage(chatId, {
          id: Number(raw.id),
          content: String(raw.content ?? ""),
          createdAt: String(raw.createdAt ?? new Date().toISOString()),
        });
      }

      // ✅ si el mensaje es del chat abierto, lo añadimos
      if (chatId === selectedChat.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === raw.id)) return prev;

          const safeSender =
            normalizeUserLite((raw as any).sender) || { id: 0, fullName: "Usuario" };

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
      }
    };

    socket.on("new_message", handler);

    return () => {
      socket.off("new_message", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

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

          // ✅ añade mensaje al chat abierto
          setMessages((prev) => (prev.some((m) => m.id === safeAck.id) ? prev : [...prev, safeAck]));

          // ✅ actualiza lastMessage + reordena lista
          bumpChatToTopWithLastMessage(selectedChat.id, {
            id: safeAck.id,
            content: safeAck.content,
            createdAt: safeAck.createdAt,
          });
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
    refOfferMsgId: number; // referencia SIEMPRE a la oferta raíz
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
          normalizeUserLite((ackMsg as any).sender) || { id: myId, fullName: (user as any)?.fullName ?? "Tú" };

        const safeAck: ChatMessageType = {
          id: Number(ackMsg.id),
          content: String(ackMsg.content ?? content),
          createdAt: String(ackMsg.createdAt ?? new Date().toISOString()),
          sender: safeSender,
        };

        setMessages((prev) => (prev.some((m) => m.id === safeAck.id) ? prev : [...prev, safeAck]));

        // ✅ ordena chats por reciente
        bumpChatToTopWithLastMessage(selectedChat.id, {
          id: safeAck.id,
          content: safeAck.content,
          createdAt: safeAck.createdAt,
        });
      }
    );
  };

  // ===================== Agrupar mensajes por fecha =====================
  const messagesByDate = useMemo(() => {
    const grouped: Record<string, ChatMessageType[]> = {};
    for (const m of messages) {
      const key = new Date(m.createdAt).toDateString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    }
    for (const k of Object.keys(grouped)) {
      grouped[k].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return grouped;
  }, [messages]);

  // ✅ chats ya ordenados
  const orderedChats = useMemo(() => sortChatsByLastMessageDesc(chats), [chats]);

  // ===================== Oferta: resolver “hilo” =====================
  type OfferThreadResolved = {
    rootMsg: ChatMessageType; // oferta original
    lastNode: ChatMessageType; // oferta activa actual (root o counter)
    terminalAction: "accept" | "reject" | null; // si ya terminó
    lastCounter: ChatMessageType | null; // último counter si existe
  };

  const resolveOfferThread = (rootMsg: ChatMessageType): OfferThreadResolved => {
    const rootId = rootMsg.id;

    const related = messages
      .filter((m) => extractOfferRefFromText(m.content) === rootId)
      .map((m) => ({
        msg: m,
        action: extractOfferActionFromText(m.content),
        ts: new Date(m.createdAt).getTime(),
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

  // ✅ mini-componente para contraoferta
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

  // ✅ Render de un “nodo de oferta” (root o counter)
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
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
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
                    {u.profilePicture ? (
                      <img src={u.profilePicture} className="avatar-img" />
                    ) : (
                      u.fullName.charAt(0).toUpperCase()
                    )}
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

                const preview = c.lastMessage?.content
                  ? stripAllMarkers(c.lastMessage.content)
                  : "Sin mensajes";

                return (
                  <div
                    key={c.id}
                    className={`chat-user-item ${selectedChat?.id === c.id ? "active" : ""}`}
                    onClick={() => handleSelectChat(c)}
                  >
                    <div className="avatar-circle">
                      {other.profilePicture ? (
                        <img src={other.profilePicture} className="avatar-img" />
                      ) : (
                        other.fullName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="chat-user-texts">
                      <span className="chat-user-name">{other.fullName}</span>
                      <span className="chat-user-sub">
                        {preview.length > 26 ? preview.slice(0, 26) + "..." : preview}
                      </span>
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
              <div className="chat-messages">
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
