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
  unreadCount?: number;
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

// Crear o devolver chat existente
export async function createOrGetChat(user2Id: number, productId?: number): Promise<ChatSummary> {
  const res = await api.post<ChatSummary>("/chat/get-or-create", { user2Id, productId });
  return res.data;
}

// Mensajes de un chat
export async function getChatMessages(chatId: number): Promise<ChatMessageType[]> {
  const res = await api.get<ChatMessageType[]>(`/chat/${chatId}/messages`);
  return res.data;
}


export async function sendMessageHttp(chatId: number, content: string): Promise<ChatMessageType> {
  const res = await api.post<ChatMessageType>(`/chat/${chatId}/messages`, { content });
  return res.data;
}

// Marcar chat como leído
export async function markChatAsRead(chatId: number): Promise<{ success: boolean }> {
  const res = await api.patch<{ success: boolean }>(`/chat/${chatId}/read`);
  return res.data;
}