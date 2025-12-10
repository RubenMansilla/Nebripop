import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chat } from "./chat.entity";
import { ChatMessage } from "./chat-message.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private readonly msgRepo: Repository<ChatMessage>,
  ) {}

  /**
   * Devuelve todos los chats donde participa el usuario
   * (como buyer o como seller) + su último mensaje.
   */
  async getUserChats(userId: number) {
    const chats = await this.chatRepo.find({
      where: [
        { buyerId: userId },
        { sellerId: userId },
      ],
      relations: ["messages"],
      order: { createdAt: "DESC" },
    });

    // Ordenar mensajes por fecha y añadir lastMessage
    return chats.map((chat) => {
      const sortedMessages = [...(chat.messages || [])].sort(
        (a, b) => b.sentAt.getTime() - a.sentAt.getTime(),
      );

      const lastMessage = sortedMessages[0] || null;

      return {
        id: chat.id,
        buyerId: chat.buyerId,
        sellerId: chat.sellerId,
        productId: chat.productId,
        createdAt: chat.createdAt,
        lastMessage,
      };
    });
  }
}
