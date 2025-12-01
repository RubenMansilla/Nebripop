import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { createClient } from '@supabase/supabase-js';

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

    // 🔥 Actualización parcial de datos
    async updateUser(id: number, data: Partial<User>) {
        await this.repo.update(id, data);
        return this.repo.findOne({ where: { id } });
    }

    // 🔥 Subir imagen y guardar URL pública
    async updateProfilePicture(id: number, file: Express.Multer.File) {
        const ext = file.originalname.split('.').pop();
        const fileName = `user_${id}_${Date.now()}.${ext}`;

        const { error } = await this.supabase.storage
            .from('userImg')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) throw new Error(error.message);

        const { data } = this.supabase.storage
            .from('userImg')
            .getPublicUrl(fileName);

        await this.repo.update(id, { profilePicture: data.publicUrl });

        const updatedUser = await this.repo.findOne({ where: { id } });
        return updatedUser;
    }
}
