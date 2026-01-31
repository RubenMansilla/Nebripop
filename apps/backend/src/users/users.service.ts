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
  ) { }

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

  // ============================================
  // PENALTY SYSTEM METHODS
  // ============================================

  /**
   * Asigna una penalización a un usuario
   * Llama a la función SQL assign_penalty que maneja la lógica de strikes
   */
  async assignPenalty(userId: number, reason?: string) {
    const result = await this.repo.query(
      `SELECT * FROM assign_penalty($1, $2)`,
      [userId, reason || null]
    );

    if (!result || result.length === 0) {
      throw new NotFoundException('No se pudo asignar la penalización');
    }

    const { new_penalty_level, is_permanent, days_until_cleanup } = result[0];

    // Retornar información completa
    return {
      userId,
      newPenaltyLevel: new_penalty_level,
      isPermanent: is_permanent,
      daysUntilCleanup: days_until_cleanup,
      message: `Penalización asignada: Strike ${new_penalty_level}`,
    };
  }

  /**
   * Obtiene el estado de penalizaciones de un usuario
   */
  async getPenaltyStatus(userId: number) {
    const user = await this.repo.findOne({
      where: { id: userId },
      select: [
        'id',
        'penaltyLevel',
        'activePenaltiesCount',
        'penaltyAssignedAt',
        'recidivismCount',
        'totalPenaltiesReceived',
      ],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Calcular días restantes hasta limpieza
    let daysUntilCleanup: number | null = null;
    if (user.penaltyLevel > 0 && user.penaltyLevel < 3 && user.penaltyAssignedAt) {
      const baseDays = user.penaltyLevel === 1 ? 30 : 180;
      const multiplier = Math.pow(2, user.recidivismCount);
      const totalDays = baseDays * multiplier;

      const assignedDate = new Date(user.penaltyAssignedAt);
      const cleanupDate = new Date(assignedDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
      const now = new Date();

      daysUntilCleanup = Math.max(0, Math.ceil((cleanupDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    }

    return {
      userId: user.id,
      penaltyLevel: user.penaltyLevel,
      activePenaltiesCount: user.activePenaltiesCount,
      penaltyAssignedAt: user.penaltyAssignedAt,
      recidivismCount: user.recidivismCount,
      totalPenaltiesReceived: user.totalPenaltiesReceived,
      daysUntilCleanup,
      canParticipate: user.penaltyLevel < 2,
      isPermanent: user.penaltyLevel === 3,
    };
  }

  /**
   * Verifica si un usuario puede participar en subastas
   * (pujar o crear nuevas subastas)
   */
  async canParticipateInAuctions(userId: number): Promise<boolean> {
    const result = await this.repo.query(
      `SELECT can_participate_in_auctions($1)`,
      [userId]
    );

    return result[0]?.can_participate_in_auctions ?? false;
  }

  /**
   * Ejecuta la limpieza manual de penalizaciones expiradas
   * Normalmente esto se ejecuta automáticamente via cron job
   */
  async cleanExpiredPenalties() {
    const result = await this.repo.query(`SELECT * FROM clean_expired_penalties()`);

    if (!result || result.length === 0) {
      return {
        totalCleaned: 0,
        strike1Cleaned: 0,
        strike2Cleaned: 0,
        details: 'No hay penalizaciones para limpiar',
      };
    }

    const { total_cleaned, strike1_cleaned, strike2_cleaned, details } = result[0];

    return {
      totalCleaned: total_cleaned,
      strike1Cleaned: strike1_cleaned,
      strike2Cleaned: strike2_cleaned,
      details,
    };
  }
}

