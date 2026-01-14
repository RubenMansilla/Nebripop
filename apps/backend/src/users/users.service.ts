import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { User } from "./users.entity";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  constructor(
    @InjectRepository(User)
    private repo: Repository<User>
  ) {}

  create(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async updateUser(id: number, data: Partial<User>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async updateProfilePicture(id: number, file: Express.Multer.File) {
    const processedImage = await sharp(file.buffer)
      .resize(800, 800, { fit: "inside" })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `user_${id}_${Date.now()}.webp`;

    const { error } = await this.supabase.storage.from("userImg").upload(fileName, processedImage, {
      contentType: "image/webp",
      upsert: true,
    });

    if (error) throw new Error(error.message);

    const { data } = this.supabase.storage.from("userImg").getPublicUrl(fileName);

    await this.repo.update(id, { profilePicture: data.publicUrl });

    return this.repo.findOne({ where: { id } });
  }

  // ✅ PERFIL PÚBLICO (solo datos visibles)
  async getPublicUser(id: number) {
    const user = await this.repo.findOne({
      where: { id },
      select: ["id", "fullName", "profilePicture", "createdAt"],
    });

    if (!user) throw new NotFoundException("Usuario no encontrado");
    return user;
  }

  // ✅ SEARCH USERS (CHAT)
  async searchUsers(q: string) {
    const query = (q ?? "").trim();

    if (query.length < 2) return [];

    // Importante: devolver SIEMPRE los campos que el front usa (id, fullName, profilePicture)
    const users = await this.repo.find({
      where: [
        { fullName: ILike(`%${query}%`) },
        // si quieres también por email, descomenta:
        // { email: ILike(`%${query}%`) },
      ],
      select: ["id", "fullName", "profilePicture"],
      take: 15,
      order: { fullName: "ASC" },
    });

    return users;
  }

  // CAMBIO DE CONTRASEÑA
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    if (oldPassword === newPassword) {
      throw new BadRequestException("La nueva contraseña debe ser diferente a la actual");
    }

    const user = await this.repo.findOne({
      where: { id: userId },
      select: ["id", "passwordHash"],
    });

    if (!user) throw new NotFoundException("Usuario no encontrado");

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) throw new BadRequestException("La contraseña actual es incorrecta");

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await this.repo.update(userId, { passwordHash: newHash });

    return { message: "Contraseña actualizada correctamente" };
  }
}
