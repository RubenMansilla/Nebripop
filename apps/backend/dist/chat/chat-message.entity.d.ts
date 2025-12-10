import { Chat } from "./chat.entity";
export declare class ChatMessage {
    id: number;
    chatId: number;
    senderId: number;
    message: string;
    sentAt: Date;
    chat: Chat;
}
