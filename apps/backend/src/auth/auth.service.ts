import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common/exceptions';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwt: JwtService,
    ) { }

    async register(data: RegisterDto) {
        // comprobar si email ya existe
        const existing = await this.usersService.findByEmail(data.email);
        if (existing) throw new ConflictException('Email already registered');

        // Hash de contraseña
        const hashedPass = await bcrypt.hash(data.password, 10);

        // Crear usuario en DB
        const user = await this.usersService.create({
            ...data,
            password: hashedPass,
        });

        // Crear token JWT
        const token = this.jwt.sign({ id: user.id, email: user.email });

        return { user, token };
    }
    async login(data: LoginDto) {

        // Buscar usuario por email
        const user = await this.usersService.findByEmail(data.email);
        if (!user) {
            throw new UnauthorizedException('Email o contraseña incorrectos');
        }

        // Comparar contraseña
        const match = await bcrypt.compare(data.password, user.password);
        if (!match) {
            throw new UnauthorizedException('Email o contraseña incorrectos');
        }

        // Crear token
        const token = this.jwt.sign({
            id: user.id,
            email: user.email,
        });

        // Devolver user sin password
        const { password, ...rest } = user;

        return { user: rest, token };
    }

}
