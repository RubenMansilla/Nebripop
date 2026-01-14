// apps/frontend/src/pages/User/Chat/Chat.tsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import "./Chat.css";

import { AuthContext } from "../../../context/AuthContext";
import { useLoginModal } from "../../../context/LoginModalContext";

import { searchUsers } from "../../../api/users.api";
import { getUserChats, createOrGetChat, getChatMessages } from "../../../api/chat.api";

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

// ===================== HELPERS =====================
const normalizeUserLite = (u: any): UserLite | null => {
  if (!u) return null;
  const id = Number(u.id);
  const fullName = String(u.fullName ?? u.full_name ?? u.name ?? "").trim();
  const profilePicture =
    u.profilePicture ??
    u.profile_picture ??
    u.avatarUrl ??
    u.avatar_url ??
    undefined;

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

// ===================== COMPONENTE (PÁGINA) =====================
export default function ChatPage() {
  const { user, token } = useContext(AuthContext);
  const { openLogin } = useLoginModal();

  // ✅ Normaliza tu id para evitar "8" vs 8 en TODA la pantalla
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

        // ✅ Backend: GET /chat/my-chats (sin userId). AxiosConfig mete el token.
        const data = await getUserChats();

        // ✅ robusto ante formatos raros
        const raw =
          Array.isArray(data)
            ? data
            : Array.isArray((data as any)?.chats)
            ? (data as any).chats
            : Array.isArray((data as any)?.data)
            ? (data as any).data
            : [];

        const safe = raw.map(normalizeChatSummary).filter(Boolean) as ChatSummary[];

        setChats(safe);

        // si el selectedChat ya no existe, lo limpiamos
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

  // ===================== Buscar usuarios (robusto) =====================
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

        // ✅ AxiosConfig mete Authorization
        const res = await searchUsers(q);

        // searchUsers ya debería devolver array, pero lo blindamos igual
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

        // quitamos al propio user + dedupe (✅ compara con myId number)
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

  // ===================== getOtherUser seguro (FIX) =====================
  // ✅ TU BACKEND YA DEVUELVE user1=yo y user2=el otro, así que SIEMPRE es user2.
  // Esto evita que por un "8" vs 8 te salga tu propio usuario.
  const getOtherUser = (chat: ChatSummary): UserLite => {
    if (!chat?.user2) return { id: 0, fullName: "Usuario desconocido" };
    return chat.user2;
  };

  // ===================== Seleccionar chat =====================
  const handleSelectChat = async (chat: ChatSummary) => {
    setSelectedChat(chat);
    setMessages([]);
    setLoadingMessages(true);

    try {
      const data = await getChatMessages(chat.id);

      // soporta array directo o {data:[...]}
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

      // ✅ opcional recomendado: orden por fecha
      safeMsgs.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(safeMsgs);
    } catch (err) {
      console.error("getChatMessages error:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }

    const socket = getChatSocket();
    socket.emit("join_chat", { chatId: chat.id });
  };

  // ===================== Crear nuevo chat ✅ (alineado con tu backend) =====================
  const handleConfirmStartChat = async () => {
    if (!confirmUser || !user || !token || creatingChat) return;

    try {
      setCreatingChat(true);

      // ✅ Backend real: POST /chat/get-or-create body { user2Id }
      const chatResp = await createOrGetChat(confirmUser.id);

      // normalizamos por si el backend devuelve algo raro
      const created =
        normalizeChatSummary(chatResp) || normalizeChatSummary((chatResp as any)?.data);

      // recargo chats (para que aparezca en la lista)
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
      setChats(safe);

      // selecciono el chat creado (preferimos el del listado)
      const chosen =
        (created?.id ? safe.find((c) => c.id === created.id) : null) ||
        (created ? created : null);

      if (chosen) {
        await handleSelectChat(chosen);
      } else {
        console.warn("No pude determinar el chat creado. Revisa la respuesta del backend:", chatResp);
      }

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

      if (chatId === selectedChat.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === raw.id)) return prev;

          // ✅ normaliza sender por si viene raro desde socket
          const safeSender = normalizeUserLite((raw as any).sender) || { id: 0, fullName: "Usuario" };

          const safeMsg: ChatMessageType = {
            id: Number(raw.id),
            content: String(raw.content ?? ""),
            createdAt: String(raw.createdAt ?? new Date().toISOString()),
            sender: safeSender,
          };

          return [...prev, safeMsg];
        });
      }
    };

    socket.on("new_message", handler);

    return () => {
      socket.off("new_message", handler);
    };
  }, [selectedChat]);

  // ===================== Enviar mensaje (POR SOCKET) ✅ =====================
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const content = newMessage.trim();
    setNewMessage("");

    try {
      const socket = getChatSocket();

      socket.emit(
        "send_message",
        // ✅ senderId siempre number
        { chatId: selectedChat.id, senderId: myId, content },
        (ackMsg: IncomingSocketMessage) => {
          if (!ackMsg?.id) return;

          const safeSender =
            normalizeUserLite((ackMsg as any).sender) || { id: myId, fullName: user.fullName ?? "Tú" };

          const safeAck: ChatMessageType = {
            id: Number(ackMsg.id),
            content: String(ackMsg.content ?? content),
            createdAt: String(ackMsg.createdAt ?? new Date().toISOString()),
            sender: safeSender,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === safeAck.id)) return prev;
            return [...prev, safeAck];
          });
        }
      );
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  // ===================== Agrupar mensajes por fecha (memo) =====================
  const messagesByDate = useMemo(() => {
    const grouped: Record<string, ChatMessageType[]> = {};
    for (const m of messages) {
      const key = new Date(m.createdAt).toDateString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    }

    // ✅ opcional recomendado: orden dentro del día
    for (const k of Object.keys(grouped)) {
      grouped[k].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return grouped;
  }, [messages]);

  // ===================== UI (PÁGINA) =====================
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

  // ===================== RETURN COMPLETO =====================
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

          {/* Loading búsqueda */}
          {searchLoading && (
            <div className="chat-small-text" style={{ marginTop: 8 }}>
              Buscando...
            </div>
          )}

          {/* No results */}
          {!searchLoading && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
            <div className="chat-small-text" style={{ marginTop: 8 }}>
              No se encontraron usuarios
            </div>
          )}

          {/* Resultados búsqueda */}
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

          {/* Confirmación */}
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
              chats.map((c) => {
                const other = getOtherUser(c);

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
                        {c.lastMessage?.content ? c.lastMessage.content.slice(0, 26) + "..." : "Sin mensajes"}
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
                    <div className="avatar-circle small">
                      {getOtherUser(selectedChat).fullName.charAt(0)}
                    </div>
                  )}
                  <h3>{getOtherUser(selectedChat).fullName}</h3>
                </div>
              </div>

              {/* Mensajes */}
              <div className="chat-messages">
                {loadingMessages ? (
                  <div className="chat-empty">Cargando mensajes...</div>
                ) : (
                  Object.entries(messagesByDate).map(([dateKey, msgs]) => (
                    <div key={dateKey}>
                      <div className="date-divider">{formatDateLabel(msgs[0].createdAt)}</div>

                      {msgs.map((msg) => (
                        <div
                          key={msg.id}
                          // ✅ FIX: compara con myId normalizado
                          className={Number(msg.sender.id) === myId ? "message own-message" : "message"}
                        >
                          <div className="message-text">{msg.content}</div>
                          <div className="message-time">{formatTime(msg.createdAt)}</div>
                        </div>
                      ))}
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
