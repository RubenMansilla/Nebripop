// apps/frontend/src/pages/User/Chat/ChatListPage.tsx
import { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ChatListPage.css";
import { AuthContext } from "../../../context/AuthContext";
import { getUserChats } from "../../../api/chat.api";
import { getChatSocket } from "../../../chatSocket";

import {
    normalizeChatSummary,
    sortChatsByLastMessageDesc,
    stripAllMarkers,
    type ChatSummary,
} from "../../../utils/ChatHelpers";

import ChatDetailPage from "./ChatDetailPage";

export default function ChatListPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const params = useParams();
    const activeChatId = params.chatId ? Number(params.chatId) : null;
    const myId = Number((user as any)?.id);

    // Estado de chats y carga
    const [chats, setChats] = useState<ChatSummary[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);

    // Estado del buscador (FILTRO)
    const [searchTerm, setSearchTerm] = useState("");

    // CARGA INICIAL
    useEffect(() => {
        if (!user) return;
        getUserChats()
            .then((data) => {
                const raw = Array.isArray(data) ? data : (data as any).data || [];
                const safe = raw.map(normalizeChatSummary).filter(Boolean) as ChatSummary[];
                setChats(sortChatsByLastMessageDesc(safe));
            })
            .finally(() => setLoadingChats(false));
    }, [user]);

    // SOCKETS
    useEffect(() => {
        const socket = getChatSocket();
        const handler = () => { console.log("Update list..."); };
        socket.on("new_message", handler);
        return () => { socket.off("new_message", handler); };
    }, []);

    // HELPER PARA OBTENER EL OTRO USUARIO
    const getOtherUser = (c: ChatSummary) => (c.user1.id === myId ? c.user2 : c.user1);

    // FILTRADO DE CHATS (Lógica del buscador)
    const filteredChats = useMemo(() => {
        if (!searchTerm.trim()) return chats;
        const lower = searchTerm.toLowerCase();
        return chats.filter(c => {
            const other = getOtherUser(c);
            // Filtrar por nombre del otro usuario
            return other.fullName.toLowerCase().includes(lower);
        });
    }, [chats, searchTerm, myId]);

    const viewModeClass = activeChatId ? "mode-chat" : "mode-list";

    return (
        <div className="chat-app">
            <div className={`chat-layout ${viewModeClass}`}>

                {/* === IZQUIERDA: LISTA DE CHATS === */}
                <div className="chat-layout__sidebar">
                    <div className="cl-header">
                        <h3 className="cl-header__title">Mis Conversaciones</h3>
                    </div>

                    {/* BUSCADOR (FILTRO) */}
                    <div className="cl-search">
                        <input
                            className="cl-search__input"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar en mis chats..."
                        />
                    </div>

                    {/* LISTA FILTRADA */}
                    <div className="cl-list">
                        {loadingChats ? (
                            <p style={{ padding: 20, textAlign: 'center', color: '#888' }}>Cargando...</p>
                        ) : filteredChats.length === 0 ? (
                            <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                                {searchTerm ? "No se encontraron chats." : "No tienes conversaciones."}
                            </div>
                        ) : (
                            filteredChats.map(c => {
                                const other = getOtherUser(c);
                                const preview = c.lastMessage ? stripAllMarkers(c.lastMessage.content) : "Sin mensajes";
                                const isActive = c.id === activeChatId;

                                return (
                                    <div
                                        key={c.id}
                                        className={`cl-item ${isActive ? "active" : ""}`}
                                        onClick={() => navigate(`/profile/chat/${c.id}`)}
                                    >
                                        <div className="c-avatar">
                                            {other.profilePicture ? <img src={other.profilePicture} alt="av" /> : other.fullName[0]}
                                        </div>
                                        <div className="cl-info">
                                            <span className="cl-info__name">{other.fullName}</span>
                                            <span className="cl-info__last-msg">{preview}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="chat-layout__main">
                    {activeChatId ? (
                        <ChatDetailPage />
                    ) : (
                        <div className="chat-placeholder">
                            <h3>¡Bienvenido al Buzón!</h3>
                            <p>Selecciona una conversación para comenzar.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}