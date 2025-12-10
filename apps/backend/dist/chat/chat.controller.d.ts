import { ChatService } from "./chat.service";
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMyChats(userId: number): Promise<{
        id: number;
        buyerId: number;
        sellerId: number;
        productId: number | null;
        createdAt: Date;
        lastMessage: import("./chat-message.entity").ChatMessage;
    }[]>;
}
