import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';

@Injectable()
export class UsersService {

    private supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE!
    );

    constructor(
        @InjectRepository(User)
        private repo: Repository<User>,
    ) { }

    create(data: Partial<User>) {
        const user = this.repo.create(data);
        return this.repo.save(user);
    }

    findByEmail(email: string) {
        return this.repo.findOne({ where: { email } });
    }

    async updateUser(id: number, data: Partial<User>) {
        await this.repo.update(id, data);
        return this.repo.findOne({ where: { id } });
    }

    async updateProfilePicture(id: number, file: Express.Multer.File) {
        const processedImage = await sharp(file.buffer)
            .resize(800, 800, { fit: 'inside' })
            .webp({ quality: 80 })
            .toBuffer();

        const fileName = `user_${id}_${Date.now()}.webp`;

        const { error } = await this.supabase.storage
            .from('userImg')
            .upload(fileName, processedImage, {
                contentType: 'image/webp',
                upsert: true
            });

        if (error) throw new Error(error.message);

        const { data } = this.supabase.storage
            .from('userImg')
            .getPublicUrl(fileName);

        await this.repo.update(id, { profilePicture: data.publicUrl });

        return this.repo.findOne({ where: { id } });
    }

    // ✅ PERFIL PÚBLICO (solo datos visibles)
    async getPublicUser(id: number) {
        const user = await this.repo.findOne({
            where: { id },
            select: ['id', 'fullName', 'profilePicture', 'createdAt'],
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
    }

    // CAMBIO DE CONTRASEÑA
    async changePassword(userId: number, oldPassword: string, newPassword: string) {

        if (oldPassword === newPassword) {
            throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
        }

        // Buscar al usuario (necesitamos el passwordHash)
        const user = await this.repo.findOne({
            where: { id: userId },
            select: ['id', 'passwordHash'] // Traer el hash
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Verificar si la contraseña antigua coincide con el hash en BD
        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) {
            throw new BadRequestException('La contraseña actual es incorrecta');
        }

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        // Actualizar en la base de datos
        await this.repo.update(userId, { passwordHash: newHash });

        return { message: 'Contraseña actualizada correctamente' };
    }
}
