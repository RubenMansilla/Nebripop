import { useContext, useEffect, useMemo, useRef, useState } from "react";
import "./ChatPopup.css";

import { AuthContext } from "../../context/AuthContext";
import { useLoginModal } from "../../context/LoginModalContext";

import {
  createOrGetChat,
  getChatMessages,
  sendMessageHttp,
  type ChatSummary,
  type ChatMessageType,
} from "../../api/chat.api";

type ProductLite = {
  id: number;
  name: string;
  price: number;
  images?: { image_url: string }[];
};

type SellerLite = {
  id: number;
  fullName?: string;
  name?: string;
  profilePicture?: string;
  profile_picture?: string;
};

type ChatPopupMode = "message" | "offer";

// ===================== MARKERS =====================
// Producto (lo que ya usas)
const buildProductMarker = (productId: number) => `/product/${productId}`;

// Oferta (nuevo)
const buildOfferMarker = (amount: number) => `/offer:${amount}`;

// Limpia marcadores para texto visible
const stripAllMarkers = (text: string) => {
  if (!text) return "";
  return text
    .replace(/\s*\/products?\/\d+\s*/gi, " ")
    .replace(/\s*\/offer:\d+(?:[.,]\d+)?\s*/gi, " ")
    .replace(/\s*\/offer_action:(accept|reject|counter)\s*/gi, " ")
    .replace(/\s*\/offer_ref:\d+\s*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const ensureProductMarker = (text: string, productId: number) => {
  const clean = stripAllMarkers(text);
  const marker = buildProductMarker(productId);
  return `${clean} ${marker}`.trim();
};

const ensureOfferMarkers = (text: string, productId: number, amount: number) => {
  const base = ensureProductMarker(text, productId);
  return `${base} ${buildOfferMarker(amount)}`.trim();
};

// ===================== FORMATOS =====================
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

export default function ChatPopup({
  open,
  onClose,
  seller,
  product,
  mode = "message",
  initialOffer = null,
}: {
  open: boolean;
  onClose: () => void;
  seller: SellerLite;
  product: ProductLite;
  mode?: ChatPopupMode;
  initialOffer?: number | null;
}) {
  const { user, token } = useContext(AuthContext);
  const { openLogin } = useLoginModal();

  const [chat, setChat] = useState<ChatSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);

  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const myId = Number((user as any)?.id);

  const sellerName = seller?.fullName ?? seller?.name ?? "Vendedor";
  const sellerAvatar = seller?.profilePicture ?? seller?.profile_picture ?? "/default-avatar.png";

  const productImg = product?.images?.[0]?.image_url ?? "/no-image.webp";

  const formatPrice = useMemo(() => {
    const v = Number(product.price);
    if (Number.isInteger(v)) return `${v}€`;
    return `${v.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}€`;
  }, [product.price]);

  // ✅ si viene desde "hacer oferta", bloqueamos modo oferta
  const lockedOfferMode = mode === "offer";
  const [isOfferMode, setIsOfferMode] = useState<boolean>(mode === "offer");
  const [offerAmount, setOfferAmount] = useState<number | null>(
    typeof initialOffer === "number" ? initialOffer : null
  );

  // ESC para cerrar
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // ✅ Abrir popup
  useEffect(() => {
    if (!open) return;

    if (!user || !token) {
      onClose();
      openLogin();
      return;
    }

    setError(null);
    setLoading(false);
    setChat(null);
    setMessages([]);

    // reset por si reutilizas el componente
    setIsOfferMode(mode === "offer");
    setOfferAmount(typeof initialOffer === "number" ? initialOffer : null);

    if (mode === "offer") {
      // En oferta no ponemos texto libre
      setText("");
    } else {
      const niceVisible =
        `Hola 😊 Me interesa tu producto “${product.name}” (${formatPrice}). ` + `¿Sigue disponible?`;
      setText(niceVisible);
    }
  }, [open, user, token, product.name, formatPrice, onClose, openLogin, mode, initialOffer]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

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

  const handleSend = async () => {
    setError(null);

    const pid = Number(product.id);

    // ✅ Construcción del mensaje
    let contentToSend = "";
    if (isOfferMode) {
      const amt = typeof offerAmount === "number" ? offerAmount : NaN;
      if (!Number.isFinite(amt) || amt <= 0) return;

      const visible = `Ofrezco ${amt}€ por este producto`;
      contentToSend = ensureOfferMarkers(visible, pid, amt);
    } else {
      const value = text.trim();
      if (!value) return;
      contentToSend = ensureProductMarker(value, pid);
    }

    let chatId = chat?.id;

    try {
      setLoading(true);

      if (!chatId) {
        const createdOrExisting = await createOrGetChat(Number(seller.id), Number(product.id));
        chatId = createdOrExisting?.id;
        setChat(createdOrExisting);

        if (chatId) {
          const msgs = await getChatMessages(chatId);
          const sorted = [...msgs].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setMessages(sorted);
        }
      }

      if (!chatId) throw new Error("No se pudo crear/obtener el chat");

      // limpiamos input antes de enviar
      if (!isOfferMode) setText("");
      else setOfferAmount(offerAmount);

      const newMsg = await sendMessageHttp(chatId, contentToSend);

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      // si era oferta, puedes cerrar popup si quieres
      // onClose();
    } catch (e: any) {
      setError(e?.message || "No se pudo enviar el mensaje");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  const hasSomeChat = Boolean(chat?.id);
  const headerSubtitle = hasSomeChat ? `Chat #${chat!.id}` : "Escribe y envía para iniciar chat";

  return (
    <div className="chatpop-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="chatpop-box" onClick={(e) => e.stopPropagation()}>
        <button className="chatpop-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="chatpop-header">
          <img className="chatpop-seller-avatar" src={sellerAvatar} alt={sellerName} />
          <div className="chatpop-header-info">
            <p className="chatpop-title">Chat con {sellerName}</p>
            <p className="chatpop-subtitle">{headerSubtitle}</p>
          </div>
        </div>

        <div className="chatpop-product">
          <img className="chatpop-product-img" src={productImg} alt={product.name} />
          <div className="chatpop-product-info">
            <p className="chatpop-product-name">{product.name}</p>
            <p className="chatpop-product-price">{formatPrice}</p>
          </div>
        </div>

        {error && <div className="chatpop-error">{error}</div>}

        <div className="chatpop-messages">
          {loading ? (
            <div className="chatpop-loading">Cargando...</div>
          ) : messages.length === 0 ? (
            <div className="chatpop-empty">
              {hasSomeChat ? "No hay mensajes todavía." : "Aún no hay conversación. Envía el primer mensaje 👇"}
            </div>
          ) : (
            Object.entries(messagesByDate).map(([dateKey, msgs]) => (
              <div key={dateKey}>
                <div className="chatpop-date-divider">{formatDateLabel(msgs[0].createdAt)}</div>

                {msgs.map((m) => {
                  const mine = Number(m.sender?.id) === myId;

                  return (
                    <div key={m.id} className={`chatpop-msg ${mine ? "mine" : "theirs"}`}>
                      <div className="chatpop-bubble">
                        <p className="chatpop-text">{stripAllMarkers(m.content)}</p>
                        <span className="chatpop-date">{formatTime(m.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chatpop-inputbar">
          {isOfferMode ? (
            <>
              <input
                type="number"
                className="chatpop-input"
                placeholder="Introduce tu oferta (solo número)"
                value={offerAmount ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") return setOfferAmount(null);
                  const n = Number(v);
                  setOfferAmount(Number.isFinite(n) ? n : null);
                }}
                onKeyDown={onKeyDown}
                min="1"
              />
              <button
                className="chatpop-send"
                type="button"
                onClick={handleSend}
                disabled={!offerAmount || offerAmount <= 0 || loading}
              >
                Enviar oferta
              </button>
            </>
          ) : (
            <>
              <textarea
                className="chatpop-input"
                placeholder="Escribe tu mensaje..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
              />
              <button
                className="chatpop-send"
                type="button"
                onClick={handleSend}
                disabled={!text.trim() || loading}
                title={!text.trim() ? "Escribe un mensaje" : "Enviar"}
              >
                Enviar
              </button>
            </>
          )}
        </div>

        {/* ✅ Toggle solo si NO está bloqueado por Detail */}
        {!lockedOfferMode && (
          <div className="chatpop-offer-toggle">
            <button className="offer-toggle-btn" type="button" onClick={() => setIsOfferMode(!isOfferMode)}>
              {isOfferMode ? "Cancelar oferta" : "Hacer oferta"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
