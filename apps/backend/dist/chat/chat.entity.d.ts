import { ChatMessage } from "./chat-message.entity";
export declare class Chat {
    id: number;
    buyerId: number;
    sellerId: number;
    productId: number | null;
    createdAt: Date;
    messages: ChatMessage[];
}
