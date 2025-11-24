import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Crear usuario nuevo (por si lo necesitas)
  async createUser(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
  }

  // Buscar por email (para login)
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Buscar por ID (para refresh)
  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // Guardar refresh token hasheado
  async updateRefreshToken(id: number, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: {
        refreshToken,
      },
    });
  }

  // Borrar refresh token (logout)
  async clearRefreshToken(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: {
        refreshToken: null,
      },
    });
  }
}
