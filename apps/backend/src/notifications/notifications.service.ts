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
    async create(userId: number | string, message: string, type: string = 'transactions', productId?: number) {
        const notification = this.notificationRepository.create({
            userId: String(userId),
            message,
            type,
            productId: productId,
        });
        return await this.notificationRepository.save(notification);
    }

    async createBatch(notificationsData: Partial<Notification>[]) {
        return await this.notificationRepository.insert(notificationsData);
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

    // ELIMINAR NOTIFICACIÓN ESPECÍFICA (Para limpieza de estados)
    async deleteByTypeAndProduct(userId: number | string, type: string, productId: number) {
        return await this.notificationRepository.delete({
            userId: String(userId),
            type: type,
            productId: productId
        });
    }
}