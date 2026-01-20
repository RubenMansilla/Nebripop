// apps/frontend/src/chatSocket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getBaseURL() {
  const raw = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return raw.replace(/\/$/, "");
}

export function getChatSocket() {
  if (!socket) {
    const url = getBaseURL();

    socket = io(url, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      path: "/socket.io/",
      auth: {
        token: localStorage.getItem("token") || "",
      },
    });

  }

  return socket;
}