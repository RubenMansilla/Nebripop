import type { DefaultEventsMap } from "@socket.io/component-emitter";
import { io, Socket } from "socket.io-client";

let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

function getBaseURL() {
  const raw = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return raw.replace(/\/$/, ""); // quita "/" final
}

export function getChatSocket() {
  if (!socket) {
    socket = io(getBaseURL(), {
      transports: ["websocket", "polling"],
      withCredentials: true, // si no usas cookies, puedes poner false (pero con true te cubres)
      auth: {
        token: localStorage.getItem("token") || "",
      },
    });

    socket.on("connect", () => {
      console.log("✅ socket connected:", socket?.id, "->", getBaseURL());
    });

    socket.on("connect_error", (err) => {
      console.error("❌ socket connect_error:", err?.message || err);
    });
  }

  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
