import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    // CREAR NOTIFICACIÓN
    async create(userId: number | string, message: string, type: string = 'transactions') {
        const notification = this.notificationRepository.create({
            userId: String(userId),
            message,
            type,
        });
        return await this.notificationRepository.save(notification);
    }

    // BUSCAR NO LEÍDAS
    async findUnreadByUser(userId: number | string) {
        return await this.notificationRepository.find({
            where: {
                userId: String(userId),
                isRead: false
            },
            order: { createdAt: 'DESC' },
        });
    }

    // MARCAR COMO LEÍDA
    async markAsRead(id: string) {
        return await this.notificationRepository.update(id, { isRead: true });
    }
}