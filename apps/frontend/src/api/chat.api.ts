import api from "../utils/axiosConfig";

export interface UserLite {
  id: number;
  fullName: string;
  profilePicture?: string;
}

export interface ChatSummary {
  id: number;
  user1: UserLite;
  user2: UserLite;
  lastMessage?: {
    id: number;
    content: string;
    createdAt: string;
  } | null;
}

export interface ChatMessageType {
  id: number;
  content: string;
  createdAt: string;
  sender: UserLite;
}

export async function getUserChats(): Promise<ChatSummary[]> {
  const res = await api.get<ChatSummary[]>("/chat/my-chats");
  return res.data;
}

// ✅ BACKEND REAL: POST /chat/get-or-create  body: { user2Id }
export async function createOrGetChat(user2Id: number): Promise<ChatSummary> {
  const res = await api.post<ChatSummary>("/chat/get-or-create", { user2Id });
  return res.data;
}

export async function getChatMessages(chatId: number): Promise<ChatMessageType[]> {
  const res = await api.get<ChatMessageType[]>(`/chat/${chatId}/messages`);
  return res.data;
}

// (opcional) enviar mensaje por HTTP si lo necesitas
export async function sendMessageHttp(chatId: number, content: string): Promise<ChatMessageType> {
  const res = await api.post<ChatMessageType>(`/chat/${chatId}/messages`, { content });
  return res.data;
}
