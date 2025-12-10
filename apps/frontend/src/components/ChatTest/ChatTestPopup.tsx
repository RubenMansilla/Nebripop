import { useEffect, useState } from "react";
import { getChatSocket } from "../../chatSocket";

export default function ChatTestPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    if (!open) return;

    const socket = getChatSocket();

    socket.emit("joinChat", { chatId: 999 }); // sala de prueba

    socket.on("newMessage", (msg: any) => {
      setMessages((prev) => [...prev, msg.content]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [open]);

  const sendMessage = () => {
    const socket = getChatSocket();
    socket.emit("sendMessage", {
      chatId: 999,
      senderId: 1, // ID de prueba
      content: newMsg,
    });
    setNewMsg("");
  };

  if (!open) return null;

  return (
    <div className="chat-popup-overlay" onClick={onClose}>
      <div className="chat-popup" onClick={(e) => e.stopPropagation()}>
        <h2>Chat de Prueba</h2>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className="message">{m}</div>
          ))}
        </div>

        <div className="chat-input-box">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Escribe un mensaje..."
          />
          <button onClick={sendMessage}>Enviar</button>
        </div>
      </div>
    </div>
  );
}
