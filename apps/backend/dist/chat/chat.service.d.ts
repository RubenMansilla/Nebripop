import { Repository } from "typeorm";
import { Chat } from "./chat.entity";
import { ChatMessage } from "./chat-message.entity";
export declare class ChatService {
    private readonly chatRepo;
    private readonly msgRepo;
    constructor(chatRepo: Repository<Chat>, msgRepo: Repository<ChatMessage>);
    getUserChats(userId: number): Promise<{
        id: number;
        buyerId: number;
        sellerId: number;
        productId: number | null;
        createdAt: Date;
        lastMessage: ChatMessage;
    }[]>;
}
