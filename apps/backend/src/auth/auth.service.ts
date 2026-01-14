import { Injectable, ForbiddenException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwt: JwtService,
        private config: ConfigService,
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
}