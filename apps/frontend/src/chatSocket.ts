import type { DefaultEventsMap } from "@socket.io/component-emitter";
import { io, Socket } from "socket.io-client";

let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

export function getChatSocket() {
  if (!socket) {
    socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });
  }
  return socket;
}
