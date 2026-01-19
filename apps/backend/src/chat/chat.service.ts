import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chat } from "./chat.entity";
import { ChatMessage } from "./chat-message.entity";
import { User } from "../users/users.entity";
import { Notification } from "../notifications/notification.entity";

type UserLite = Pick<User, "id" | "fullName" | "profilePicture">;

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,

    @InjectRepository(ChatMessage)
    private readonly msgRepo: Repository<ChatMessage>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>
  ) { }

  private getUserLite(id: number): Promise<UserLite | null> {
    return this.userRepo.findOne({
      where: { id },
      select: ["id", "fullName", "profilePicture"],
    });
  }

  private async getLastMessage(chatId: number) {
    return this.msgRepo.findOne({
      where: { chat: { id: chatId } },
      order: { createdAt: "DESC" },
      relations: ["sender"],
    });
  }

  // ==============================
  // Obtener todos los chats del usuario
  // ==============================
  async getUserChats(userId: number) {
    const chats = await this.chatRepo.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      order: { createdAt: "DESC" },
    });

    const me = await this.getUserLite(userId);

    const result = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await this.getLastMessage(chat.id);

        // ✅ FIX CRÍTICO: buyerId/sellerId pueden venir como string (int8/bigint)
        const buyerId = Number((chat as any).buyerId);
        const sellerId = Number((chat as any).sellerId);

        const isBuyer = buyerId === userId;
        const otherUserId = isBuyer ? sellerId : buyerId;

        const other = await this.getUserLite(otherUserId);

        return {
          id: chat.id,
          user1: me, // ✅ yo SIEMPRE
          user2: other, // ✅ el otro SIEMPRE
          lastMessage:
            lastMessage && typeof lastMessage === "object"
              ? {
                id: lastMessage.id,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
              }
              : null,
        };
      })
    );

    // Por si algún user viniera null (usuario borrado, etc.)
    return result.filter((c) => c.user1 && c.user2);
  }

  // ==============================
  // Crear o devolver un chat existente
  // ✅ devuelve el mismo formato que getUserChats
  // ==============================
  async getOrCreateChat(meId: number, otherId: number) {
    // validar usuarios (lite)
    const [meLite, otherLite] = await Promise.all([
      this.userRepo.findOne({
        where: { id: meId },
        select: ["id", "fullName", "profilePicture"],
      }),
      this.userRepo.findOne({
        where: { id: otherId },
        select: ["id", "fullName", "profilePicture"],
      }),
    ]);

    if (!meLite || !otherLite)
      throw new NotFoundException("Usuario no encontrado");

    // buscar chat existente (en ambos sentidos)
    const existing = await this.chatRepo.findOne({
      where: [
        { buyerId: meId, sellerId: otherId },
        { buyerId: otherId, sellerId: meId },
      ],
    });

    if (existing) {
      const lastMessage = await this.getLastMessage(existing.id);

      // ✅ mantenemos el mismo formato: user1=yo, user2=el otro
      return {
        id: existing.id,
        user1: meLite,
        user2: otherLite,
        lastMessage:
          lastMessage && typeof lastMessage === "object"
            ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
            }
            : null,
      };
    }

    // crear chat nuevo
    const created = await this.chatRepo.save({
      buyerId: meId,
      sellerId: otherId,
    });

    return {
      id: created.id,
      user1: meLite,
      user2: otherLite,
      lastMessage: null,
    };
  }

  // ==============================
  // Obtener mensajes de un chat
  // ==============================
  async getChatMessages(chatId: number) {

    const msgs = await this.msgRepo.find({
      where: { chat: { id: chatId } },
      order: { createdAt: "ASC" },
      relations: ["sender"],
    });

    // devolvemos limpio
    return msgs.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      sender: m.sender
        ? {
          id: m.sender.id,
          fullName: m.sender.fullName,
          profilePicture: m.sender.profilePicture,
        }
        : null,
    }));
  }

  // ==============================
  // Crear mensaje
  // ==============================
  async createMessage(chatId: number, senderId: number, content: string) {
    const [chat, sender] = await Promise.all([
      this.chatRepo.findOne({ where: { id: chatId } }),
      this.userRepo.findOne({ where: { id: senderId } }),
    ]);

    if (!chat) throw new NotFoundException("Chat no encontrado");
    if (!sender) throw new NotFoundException("Usuario no encontrado");

    const msg = await this.msgRepo.save({
      chat,
      sender,
      content,
    });

    // Crear notificación para el otro usuario
    try {
      // Asegurar que sean números
      const buyerId = Number((chat as any).buyerId);
      const sellerId = Number((chat as any).sellerId);

      // Calcular quién recibe la notificación
      const recipientId = (senderId === buyerId) ? sellerId : buyerId;

      console.log(`Notificando: Sender=${senderId}, Buyer=${buyerId}, Seller=${sellerId} -> Recipient=${recipientId}`);

      // Guardar notificación en BD
      if (recipientId) {
        await this.notificationRepo.save({
          userId: recipientId.toString(),
          type: 'newMessage',
          message: `Nuevo mensaje de ${sender.fullName}`,
          isRead: false,
        });
      }
    } catch (error) {
      console.error("Error creando notificación de chat:", error);
    }

    return {
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      sender: {
        id: sender.id,
        fullName: sender.fullName,
        profilePicture: sender.profilePicture,
      },
    };
  }
}
