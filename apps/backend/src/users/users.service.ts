import { Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

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
}
