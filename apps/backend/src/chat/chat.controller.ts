import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // GET /chat/my-chats/3   → todos los chats del usuario 3
  @Get("my-chats/:userId")
  async getMyChats(@Param("userId", ParseIntPipe) userId: number) {
    return this.chatService.getUserChats(userId);
  }
}
