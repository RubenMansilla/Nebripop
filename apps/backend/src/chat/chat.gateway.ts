// apps/backend/src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    // ✅ Permite localhost + Vercel + lo que pongas por ENV
    origin: [
      'http://localhost:5173',
      'https://nebripop.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;



  constructor(

    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService
  ) { }

  @SubscribeMessage('join_chat')
  handleJoin(@MessageBody() data: { chatId: number }, @ConnectedSocket() client: Socket) {
    const room = `chat_${data.chatId}`;
    client.join(room);
    return { ok: true };
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { chatId: number; senderId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const msg = await this.chatService.createMessage(
      data.chatId,
      data.senderId,
      data.content,
    );

    const room = `chat_${data.chatId}`;

    // 👇 Emitimos SIEMPRE con chatId plano (para que el front lo detecte seguro)
    this.server.to(room).emit('new_message', {
      ...msg,
      chatId: data.chatId,
    });

    // esto es lo que recibirá el ack en el cliente si lo usas
    return {
      ...msg,
      chatId: data.chatId,
    };
  }
}
