const API_URL = "http://localhost:3000";

export interface LastMessage {
  id: number;
  senderId: number;
  message: string;
  sentAt: string;
}

export interface UserChat {
  id: number;
  buyerId: number;
  sellerId: number;
  productId: number | null;
  createdAt: string;
  lastMessage: LastMessage | null;
}

export async function getMyChats(userId: number): Promise<UserChat[]> {
  const res = await fetch(`${API_URL}/chat/my-chats/${userId}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al cargar los chats");
  }

  return res.json();
}
