// apps/frontend/src/chatSocket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getBaseURL() {
  // Asegúrate de que esto devuelve 'https://nebripop.onrender.com' sin barra final
  const raw = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return raw.replace(/\/$/, "");
}

export function getChatSocket() {
  if (!socket) {
    const url = getBaseURL();
    console.log("🔌 Intentando conectar Socket a:", url); // <--- LOG PARA DEPURAR

    socket = io(url, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      path: "/socket.io/", // Aseguramos el path estándar
      auth: {
        token: localStorage.getItem("token") || "",
      },
    });

    socket.on("connect", () => {
      console.log("✅ SOCKET CONECTADO! ID:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ SOCKET ERROR:", err.message);
      // Si ves "websocket error", suele ser CORS o URL mal escrita
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket desconectado:", reason);
    });
  }

  return socket;
}