import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
    Patch
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";

@Controller("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService,
        private readonly chatGateway: ChatGateway
    ) { }

    // ✅ Traer chats del usuario logueado
    // GET /chat/my-chats
    @UseGuards(JwtAuthGuard)
    @Get("my-chats")
    getMyChats(@Req() req) {
        return this.chatService.getUserChats(req.user.id);
    }

    // ✅ Crear o devolver chat existente
    // POST /chat/get-or-create  body: { user2Id: number }
    @UseGuards(JwtAuthGuard)
    @Post("get-or-create")
    getOrCreate(@Req() req, @Body() body: { user2Id: number; productId?: number }) {
        return this.chatService.getOrCreateChat(req.user.id, body.user2Id, body.productId);
    }

    // ✅ Mensajes de un chat
    // GET /chat/:chatId/messages
    @UseGuards(JwtAuthGuard)
    @Get(":chatId/messages")
    getMessages(@Param("chatId", ParseIntPipe) chatId: number) {
        return this.chatService.getChatMessages(chatId);
    }

    // POST /chat/:chatId/messages  body: { content: string }
    @UseGuards(JwtAuthGuard)
    @Post(":chatId/messages")
    async sendMessage(
        @Req() req,
        @Param("chatId", ParseIntPipe) chatId: number,
        @Body() body: { content: string }
    ) {
        // Guardar en Base de Datos
        const newMessage = await this.chatService.createMessage(
            chatId,
            req.user.id,
            body.content
        );

        const roomName = `chat_${chatId}`;

        // Emitir
        this.chatGateway.server.to(roomName).emit('new_message', {
            ...newMessage,
            chatId: chatId
        });

        return newMessage;
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':chatId/read')
    async markChatAsRead(
        @Req() req,
        @Param('chatId', ParseIntPipe) chatId: number
    ) {
        return this.chatService.markMessagesAsRead(chatId, req.user.id);
    }
}
