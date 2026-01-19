import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
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
    getOrCreate(@Req() req, @Body() body: { user2Id: number }) {
        return this.chatService.getOrCreateChat(req.user.id, body.user2Id);
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

        try {
            const roomName = `chat_${chatId}`;
            console.log(`📡 [3/4] Intentando emitir a sala: '${roomName}'`);

            // Verificamos si el gateway existe
            if (!this.chatGateway) {
                throw new Error("CRÍTICO: this.chatGateway es undefined");
            }
            // Verificamos si el server existe
            if (!this.chatGateway.server) {
                throw new Error("CRÍTICO: this.chatGateway.server es undefined (Socket no iniciado)");
            }

            // Emitimos
            this.chatGateway.server.to(roomName).emit('new_message', {
                ...newMessage,
                chatId: chatId
            });
            console.log(`🎉 [4/4] ÉXITO: Evento 'new_message' emitido.`);

        } catch (error) {
            console.error("❌ ERROR CRÍTICO EMITIENDO SOCKET:", error);
            // No lanzamos error HTTP para no romper la petición del usuario, 
            // pero ya sabemos que el socket falló.
        }

        return newMessage;
    }
}
