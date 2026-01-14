import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../users/users.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  @JoinColumn({ name: "chat_id" })
  chat: Chat;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "sender_id" })
  sender: User;

  @Column({ name: "message", type: "text" })
  content: string;

  @CreateDateColumn({ name: "sent_at" })
  createdAt: Date;
}
