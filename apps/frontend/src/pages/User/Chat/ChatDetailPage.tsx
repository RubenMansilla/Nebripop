import { useContext, useEffect, useRef, useState, useLayoutEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./ChatListPage.css";
import { AuthContext } from "../../../context/AuthContext";
import { getChatMessages, getUserChats } from "../../../api/chat.api";
import { getProductById } from "../../../api/products.api";
import { getChatSocket } from "../../../chatSocket";

import {
    type ChatMessageType,
    type ProductLite,
    normalizeMessage,
    toTs,
    extractMessagesArray,
    extractAllProductIdsFromText,
    extractProductIdFromText,
    extractOfferAmountFromText,
    extractOfferActionFromText,
    extractOfferRefFromText,
    extractPayLinkFromText,
    stripAllMarkers,
    isOfferNode,
    buildOfferActionContent,
    normalizeChatSummary,
    type ChatSummary
} from "../../../utils/ChatHelpers";

export default function ChatDetailPage() {

    const { chatId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);

    const myId = Number((user as any)?.id);

    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");

    const [chatProducts, setChatProducts] = useState<ProductLite[]>([]);

    const loadingProductsRef = useRef<Set<number>>(new Set());

    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const [headerUser, setHeaderUser] = useState<{ name: string; avatar?: string } | null>(null);

    const [counterOfferModeId, setCounterOfferModeId] = useState<number | null>(null);
    const [counterValue, setCounterValue] = useState("");

    const isFirstLoadRef = useRef(true);

    const [isReady, setIsReady] = useState(false);

    // FUNCIÓN DE CARGA DE PRODUCTOS
    const fetchMissingProducts = async (msgs: ChatMessageType[]) => {
        const missingIds = new Set<number>();

        // Buscar IDs en los mensajes
        msgs.forEach(m => {
            const ids = extractAllProductIdsFromText(m.content);
            ids.forEach(id => {
                const alreadyHas = chatProducts.some(p => p.id === id);
                if (!alreadyHas && !loadingProductsRef.current.has(id)) {
                    missingIds.add(id);
                }
            });
        });

        if (missingIds.size === 0) return;

        // Marcar como cargando
        missingIds.forEach(id => loadingProductsRef.current.add(id));

        try {
            const newProducts: ProductLite[] = [];
            for (const id of missingIds) {
                try {
                    const p: any = await getProductById(String(id));
                    if (p) {
                        newProducts.push({
                            id: Number(p.id),
                            name: String(p.name ?? "Producto"),
                            price: Number(p.price ?? 0),
                            images: p.images ?? [],
                        });
                    }
                } catch (e) {
                    console.error(`Error cargando producto ${id}`, e);
                    loadingProductsRef.current.delete(id); // Permitir reintentar si falló
                }
            }

            if (newProducts.length > 0) {
                setChatProducts(prev => {
                    // Fusionar evitando duplicados
                    const existing = new Set(prev.map(x => x.id));
                    const toAdd = newProducts.filter(x => !existing.has(x.id));
                    return [...prev, ...toAdd];
                });
            }
        } finally {
            // Limpiar semáforo
            missingIds.forEach(id => loadingProductsRef.current.delete(id));
        }
    };

    // DETECTAR NUEVOS MENSAJES Y CARGAR PRODUCTOS
    useEffect(() => {
        if (messages.length > 0) {
            // Cada vez que cambien los mensajes, revisar si falta algún producto
            fetchMissingProducts(messages);
        }
    }, [messages, chatProducts]); // Añadir chatProducts para asegurar que se refresque si cambia


    // SOCKET (Solo añade mensajes)
    useEffect(() => {
        if (!chatId || !token) return;

        const socket = getChatSocket();

        socket.emit("join_chat", { chatId });

        const handler = (rawMsg: any) => {

            // Verificación de chat ID laxa (string vs number)
            const msgChatId = rawMsg.chatId ?? rawMsg.chat?.id;
            if (String(msgChatId) !== String(chatId)) return;

            const m = normalizeMessage(rawMsg);
            if (!m) return;

            // Comprobar si trae marcadores de oferta
            const hasOffer = isOfferNode(m.content);
            const extractedPid = extractProductIdFromText(m.content);

            setMessages(prev => {
                if (prev.some(x => x.id === m.id)) return prev;
                return [...prev, m];
            });
            // NOTA: Al hacer setMessages, saltará el useEffect de arriba (punto 2) y cargará el producto.
        };

        socket.on("new_message", handler);
        return () => { socket.off("new_message", handler); };
    }, [chatId, token]);


    // 4. CARGA INICIAL (HTTP)
    useEffect(() => {
        if (!chatId || !token) return;
        setLoading(true);
        getChatMessages(chatId)
            .then(res => {
                const raw = extractMessagesArray(res);
                const norm = raw.map(normalizeMessage).filter(Boolean) as ChatMessageType[];
                norm.sort((a, b) => toTs(a.createdAt) - toTs(b.createdAt));
                setMessages(norm);
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        // Cargar info del usuario del header
        getUserChats().then((data) => {
            const raw = Array.isArray(data) ? data : (data as any).data || [];
            const safe = raw.map(normalizeChatSummary).filter(Boolean) as ChatSummary[];
            const currentChat = safe.find(c => String(c.id) === String(chatId));
            if (currentChat) {
                const other = currentChat.user1.id === myId ? currentChat.user2 : currentChat.user1;
                setHeaderUser({ name: other.fullName, avatar: other.profilePicture });
            }
        }).catch(() => { });
    }, [chatId, token, myId]);

    // Manejar scroll para mostrar botón flotante
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;

        // Si la distancia desde el fondo es mayor a 150px, mostrar botón
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        setShowScrollButton(distanceFromBottom > 150);
    };

    // Función para bajar al hacer clic en el botón flotante
    const scrollToBottomSmooth = () => {
        bottomRef.current?.scrollIntoView();
    };

    // Scroll al fondo
    useLayoutEffect(() => {

        if (loading) return;

        // Si no hay mensajes, mostrar el chat vacío inmediatamente
        if (messages.length === 0) {
            setIsReady(true);
            return;
        }

        if (!bottomRef.current) return;

        if (isFirstLoadRef.current) {
            // Salto INSTANTÁNEO
            bottomRef.current.scrollIntoView({ behavior: "auto" });

            isFirstLoadRef.current = false;

            // Hacer visible el chat en el siguiente ciclo de pintado
            setTimeout(() => {
                setIsReady(true);
            }, 0);
        } else {
            // Scroll en nuevos mensajes
            bottomRef.current.scrollIntoView();
        }
    }, [messages, loading]);

    // RENDERIZADO DE LA TARJETA DE OFERTA
    const RenderOfferCard = ({ msg, rootMsg }: { msg: ChatMessageType, rootMsg: ChatMessageType }) => {
        const pid = extractProductIdFromText(msg.content);
        const offerAmount = extractOfferAmountFromText(msg.content);

        // Si se detecta que es oferta pero falla el parseo, mostrar error visual 
        if (!pid || offerAmount === null) {
            if (process.env.NODE_ENV === 'development') {
                return <div className="offer-error" style={{ border: '1px solid red', padding: 5, fontSize: 10, color: 'red' }}>
                    Error datos oferta: PID:{pid} Amt:{offerAmount}
                </div>
            }
            return null;
        }

        // Buscar el producto en el estado
        const product = chatProducts.find(p => p.id === pid);

        // Placeholder visual mientras carga
        const img = product?.images?.[0]?.image_url ?? "/no-image.webp";
        const name = product ? product.name : "Cargando info...";
        const originalPrice = product?.price;

        const thread = resolveOfferThread(rootMsg);
        const isMine = Number(msg.sender.id) === myId;
        const isBuyer = Number(rootMsg.sender.id) === myId;

        let statusLabel = null;
        if (thread.terminalAction === "accept") statusLabel = "Aceptada";
        else if (thread.terminalAction === "reject") statusLabel = "Rechazada";
        else if (thread.lastCounter) statusLabel = "Contraoferta";

        const isLastActiveNode = thread.lastNode.id === msg.id;
        const canRespond = !thread.terminalAction && isLastActiveNode && !isMine;

        let payLink: string | null = null;
        if (thread.terminalAction === "accept") {
            const acceptMsg = messages.find(m =>
                extractOfferRefFromText(m.content) === rootMsg.id &&
                extractOfferActionFromText(m.content) === "accept"
            );
            if (acceptMsg) payLink = extractPayLinkFromText(acceptMsg.content);
        }

        const isEditingCounter = counterOfferModeId === msg.id;

        return (
            <div className="offer-card">
                <Link to={`/product/${pid}`} className="offer-link">
                    <img src={img} alt={name} className="offer-img" />
                    <div className="offer-info">
                        <div className="offer-info-title">{name}</div>
                        <div className="offer-info-price">
                            {/* Si no hay precio original, mostrar '...' */}
                            Orig: {originalPrice ? formatPrice(originalPrice) : '...'} → <b>{formatPrice(offerAmount)}</b>
                        </div>
                        {statusLabel && <div className="offer-info-status">{statusLabel}</div>}
                    </div>
                </Link>

                {canRespond && (
                    <div className="offer-actions-container">
                        {!isEditingCounter ? (
                            <div className="offer-actions">
                                <button className="offer-btn acc" onClick={() => sendOfferAction({ productId: pid, offerAmount, action: "accept", refOfferMsgId: rootMsg.id })}>Aceptar</button>
                                <button className="offer-btn rej" onClick={() => sendOfferAction({ productId: pid, offerAmount, action: "reject", refOfferMsgId: rootMsg.id })}>Rechazar</button>
                                <button className="offer-btn" onClick={() => { setCounterOfferModeId(msg.id); setCounterValue(""); }}>Contraofertar</button>
                            </div>
                        ) : (
                            <div className="offer-counter-input-area">
                                <input
                                    className="offer-counter-input"
                                    type="number"
                                    autoFocus
                                    placeholder="Precio"
                                    value={counterValue}
                                    onChange={(e) => setCounterValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && counterValue && Number(counterValue) > 0) {
                                            sendOfferAction({ productId: pid, offerAmount: Number(counterValue), action: "counter", refOfferMsgId: rootMsg.id });
                                        }
                                    }}
                                />
                                <span className="offer-counter-currency">€</span>
                                <button className="offer-counter-btn acc" onClick={() => {
                                    if (counterValue && Number(counterValue) > 0) sendOfferAction({ productId: pid, offerAmount: Number(counterValue), action: "counter", refOfferMsgId: rootMsg.id });
                                }}>✔</button>
                                <button className="offer-counter-btn rej" onClick={() => setCounterOfferModeId(null)}>✕</button>
                            </div>
                        )}
                    </div>
                )}
                {thread.terminalAction === "accept" && payLink && isBuyer && (
                    <div className="offer-actions">
                        <button className="offer-btn acc" onClick={() => navigate(payLink!)}>Pagar Ahora</button>
                    </div>
                )}
            </div>
        );
    };

    // --- Helpers de envio y estructura ---
    const handleSend = () => {
        if (!newMessage.trim()) return;
        const socket = getChatSocket();
        socket.emit("send_message", { chatId, senderId: myId, content: newMessage });
        setNewMessage("");
    };

    const sendOfferAction = (payload: any) => {
        const content = buildOfferActionContent(payload);
        const socket = getChatSocket();
        socket.emit("send_message", { chatId, senderId: myId, content });
        setCounterOfferModeId(null);
        setCounterValue("");
    };

    const resolveOfferThread = (rootMsg: ChatMessageType) => {
        const rootId = rootMsg.id;
        const related = messages
            .filter((m) => extractOfferRefFromText(m.content) === rootId)
            .map((m) => ({
                msg: m, action: extractOfferActionFromText(m.content), ts: toTs(m.createdAt),
            }))
            .filter((x) => x.action)
            .sort((a, b) => a.ts - b.ts);
        const lastCounter = [...related].reverse().find((x) => x.action === "counter")?.msg ?? null;
        const terminalEntry = [...related].reverse().find((x) => x.action === "accept" || x.action === "reject");
        const terminalAction = terminalEntry ? (terminalEntry.action as "accept" | "reject") : null;
        return { rootMsg, lastNode: lastCounter ?? rootMsg, terminalAction, lastCounter };
    };

    const formatTime = (dateStr: string) => new Date(toTs(dateStr)).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const formatDateLabel = (dateStr: string) => new Date(toTs(dateStr)).toLocaleDateString("es-ES");
    const formatPrice = (v: number) => Number(v).toLocaleString("es-ES", { minimumFractionDigits: 0 }) + "€";

    const messagesByDate = useMemo(() => {
        const grouped: Record<string, ChatMessageType[]> = {};
        for (const m of messages) {
            const key = new Date(toTs(m.createdAt)).toDateString();
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(m);
        }
        return grouped;
    }, [messages]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <div className="cr-header">
                <button className="cr-back-btn" onClick={() => navigate("/profile/chat")}><span>←</span> Volver</button>
                <h3 className="cr-header__title">{headerUser?.name || "Chat"}</h3>
            </div>

            <div
                className="cr-messages"
                ref={messagesContainerRef}
                onScroll={handleScroll}
                style={{ opacity: isReady && !loading ? 1 : 0 }}
            >
                {loading ? <p style={{ textAlign: 'center', padding: 20, color: '#888' }}>Cargando...</p> :
                    Object.entries(messagesByDate).map(([dateLabel, msgs]) => (
                        <div key={dateLabel} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="cr-date-divider">{formatDateLabel(msgs[0].createdAt)}</div>
                            {msgs.map(msg => {
                                const mine = Number(msg.sender.id) === myId;
                                let offerCard = null;
                                // Verificar si es oferta
                                if (isOfferNode(msg.content)) {
                                    const action = extractOfferActionFromText(msg.content);
                                    if (action === "counter") {
                                        const rootId = extractOfferRefFromText(msg.content);
                                        const rootMsg = rootId ? messages.find(m => m.id === rootId) : null;
                                        if (rootMsg) offerCard = <RenderOfferCard msg={msg} rootMsg={rootMsg} />;
                                    } else {
                                        offerCard = <RenderOfferCard msg={msg} rootMsg={msg} />;
                                    }
                                }
                                return (
                                    <div key={msg.id} className={`msg-row ${mine ? "msg-row--mine" : "msg-row--theirs"}`}>
                                        <div className="msg-bubble">
                                            {offerCard}
                                            <div className="msg-text">{stripAllMarkers(msg.content)}</div>
                                            <span className="msg-time">{formatTime(msg.createdAt)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                }
                <div ref={bottomRef} />
            </div>

            <button
                className={`scroll-bottom-btn ${showScrollButton ? 'visible' : ''}`}
                onClick={scrollToBottomSmooth}
            >
                ↓
            </button>

            <div className="cr-input-area">
                <input
                    className="cr-input"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe un mensaje..."
                />
                <button className="cr-send-btn" onClick={handleSend}>➤</button>
            </div>
        </div>
    );
}