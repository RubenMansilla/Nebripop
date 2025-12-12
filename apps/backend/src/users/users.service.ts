import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

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

    // Actualización parcial de datos
    async updateUser(id: number, data: Partial<User>) {
        await this.repo.update(id, data);
        return this.repo.findOne({ where: { id } });
    }

    // Subir imagen y guardar URL pública
    async updateProfilePicture(id: number, file: Express.Multer.File) {
        // 1. Procesar imagen con Sharp
        const processedImage = await sharp(file.buffer)
            .resize(800, 800, { fit: 'inside' })  // límite de tamaño
            .webp({ quality: 80 })                // compresión potente
            .toBuffer();

        const fileName = `user_${id}_${Date.now()}.webp`;

        // 2. Subir imagen optimizada a Supabase
        const { error } = await this.supabase.storage
            .from('userImg')
            .upload(fileName, processedImage, {
                contentType: 'image/webp',
                upsert: true
            });

        if (error) throw new Error(error.message);

        // 3. Conseguir URL pública
        const { data } = this.supabase.storage
            .from('userImg')
            .getPublicUrl(fileName);

        // 4. Guardar nueva URL en la BD
        await this.repo.update(id, { profilePicture: data.publicUrl });

        return this.repo.findOne({ where: { id } });
    }
}
