import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';

import { ChatMessage } from './chat-message.entity';
import { Product } from '../products/products.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'buyer_id', type: 'int8' })
  buyerId: number;

  @Column({ name: 'seller_id', type: 'int8' })
  sellerId: number;

  @ManyToMany(() => Product, (product) => product.chats)
  @JoinTable({
    name: 'chat_products',
    joinColumn: { name: 'chat_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ChatMessage, (msg) => msg.chat)
  messages: ChatMessage[];
}
