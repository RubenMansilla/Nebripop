import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

// ✅ AÑADIDOS PARA IDEA 1
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { PasswordResetEntity } from './password-reset.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
    private config: ConfigService,

    // ✅ AÑADIDO: email
    private mailService: MailService,

    // ✅ AÑADIDO: tabla password_resets
    @InjectRepository(PasswordResetEntity)
    private passwordResetRepo: Repository<PasswordResetEntity>,
  ) { }

  // --- LOGIN ---
  async login(data: LoginDto) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    // Generar los tokens
    const tokens = await this.getTokens(user.id, user.email);

    // Guardar el hash del Refresh Token en BD
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  // --- REGISTRO ---
  async register(data: RegisterDto) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) throw new ConflictException('Email ya existe');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
    });

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  // --- LOGOUT  ---
  async logout(userId: number) {
    // Borrar el refresh token de la BD
    await this.usersService.updateUser(userId, { refreshToken: null });
  }

  // --- REFRESH TOKENS  ---
  async refreshTokens(userId: number, rt: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) throw new ForbiddenException('Acceso denegado');

    // Comparar el token que envía el usuario con el hash en BD
    const rtMatches = await bcrypt.compare(rt, user.refreshToken);
    if (!rtMatches) throw new ForbiddenException('Acceso denegado');

    // Si todo ok, generar nuevos tokens
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // Generador de pares de tokens
  async getTokens(userId: number, email: string) {
    const [at, rt] = await Promise.all([
      // Access Token: 15 minutos
      this.jwt.signAsync(
        { sub: userId, email },
        { secret: this.config.get('JWT_SECRET'), expiresIn: '15m' },
      ),
      // Refresh Token: 30 Días
      this.jwt.signAsync(
        { sub: userId, email },
        { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: '30d' },
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  // Guarda el hash del RT en base de datos
  async updateRefreshToken(userId: number, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.usersService.updateUser(userId, { refreshToken: hash });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, refreshToken, ...result } = user;
    return result;
  }

  // =========================================================
  // ✅ OLVIDÉ MI CONTRASEÑA (IDEA 1: token + password_resets + email)
  // =========================================================

  // 1) Solicitar recuperación: guarda token_hash en DB y manda email con link
  async forgotPassword(email: string) {
    const mail = (email || '').trim().toLowerCase();

    // ✅ Respuesta genérica siempre (para no revelar si existe)
    const generic = {
      message:
        'Si el email existe, te enviaremos un correo con instrucciones para recuperar la contraseña.',
    };

    if (!mail) return generic;

    const user = await this.usersService.findByEmail(mail);
    if (!user) return generic;

    // token aleatorio (en claro SOLO para el link)
    const token = crypto.randomBytes(32).toString('hex');

    // guardamos hash en DB
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // expira en 15 min
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.passwordResetRepo.save({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used_at: null,
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    // 🚀 Enviar el correo en segundo plano (sin await) para que la respuesta sea inmediata
    // y la vista no se quede en "Enviando..." si el servidor de correo o Render es muy lento
    this.mailService.sendPasswordResetEmail(user.email, resetLink).catch(err => {
      console.error(`forgotPassword: Fallo crítico al enviar email a ${user.email} ->`, err);
    });

    return generic;
  }

  // 2) Confirmar reset: valida token en DB (hash), no usado, no expirado, y actualiza passwordHash
  async resetPassword(token: string, newPassword: string) {
    const t = (token || '').trim();
    const pwd = (newPassword || '').trim();

    if (!t || !pwd) throw new BadRequestException('Token y nueva contraseña son requeridos');
    if (pwd.length < 6) throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');

    const tokenHash = crypto.createHash('sha256').update(t).digest('hex');

    const row = await this.passwordResetRepo.findOne({
      where: { token_hash: tokenHash },
    });

    if (!row) throw new BadRequestException('Token inválido');
    if (row.used_at) throw new BadRequestException('Token ya usado');
    if (new Date(row.expires_at).getTime() < Date.now()) throw new BadRequestException('Token expirado');

    const passwordHash = await bcrypt.hash(pwd, 10);
    await this.usersService.updateUser(row.user_id, { passwordHash });

    // marcar como usado
    row.used_at = new Date();
    await this.passwordResetRepo.save(row);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
