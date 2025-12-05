import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwt: JwtService,
    ) { }

    async register(data: RegisterDto) {
        console.log("ENV JWT_SECRET (auth.service register):", process.env.JWT_SECRET);

        // Verificar si el email ya existe
        const existing = await this.usersService.findByEmail(data.email);
        if (existing) {
            throw new ConflictException('Email ya está registrado');
        }

        console.log("Register data:", data);

        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(data.password, 10);

        // Crear usuario
        const user = await this.usersService.create({
            fullName: data.fullName,
            email: data.email,
            passwordHash
        });

        // Crear token
        const token = this.jwt.sign({
            id: user.id,
            email: user.email,
        });

        // Ocultar passwordHash
        const { passwordHash: omit, ...safeUser } = user;

        return { user: safeUser, token };
    }

    async login(data: LoginDto) {
        // 1. Log de lo que llega desde el frontend
        console.log("EMAIL:", data.email);
        console.log("PASSWORD:", data.password);
        console.log("ENV JWT_SECRET (auth.service login):", process.env.JWT_SECRET);

        const user = await this.usersService.findByEmail(data.email);
        if (!user) {
            throw new UnauthorizedException('Email o contraseña incorrectos');
        }

        // Comparar contraseña
        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedException('Email o contraseña incorrectos');
        }

        // Crear token
        const token = this.jwt.sign({
            id: user.id,
            email: user.email,
        });

        // Ocultar passwordHash
        const { passwordHash: omit, ...safeUser } = user;

        return { user: safeUser, token };
    }
}
