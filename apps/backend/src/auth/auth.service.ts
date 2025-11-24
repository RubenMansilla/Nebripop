import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private usersService: UsersService,
  ) {}

async validateUser(email: string, password: string) {
  console.log("EMAIL RECIBIDO:", email);

  const user = await this.usersService.findByEmail(email);
  console.log("USUARIO ENCONTRADO:", user);

  if (!user) {
    console.log("❌ NO EXISTE EL USUARIO CON ESE EMAIL");
    throw new UnauthorizedException('Email o contraseña incorrectos');
  }

  const passValid = await bcrypt.compare(password, user.passwordHash);
  console.log("PASSWORD RECIBIDO:", password);
  console.log("HASH EN BD:", user.passwordHash);
  console.log("¿PASSWORD CORRECTA?:", passValid);

  if (!passValid) {
    console.log("❌ CONTRASEÑA INCORRECTA");
    throw new UnauthorizedException('Email o contraseña incorrectos');
  }

  console.log("✔ LOGIN CORRECTO");
  return user;
}

  async login(email: string, password: string, res: any) {
    const user = await this.validateUser(email, password);

    const tokens = await this.generateTokens(user.id, user.email);

    const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefresh);

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return { access_token: tokens.access_token };
  }

  generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const access_token = this.jwt.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refresh_token = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { access_token, refresh_token };
  }

  async refresh(userId: number, email: string, res: any) {
    const tokens = this.generateTokens(userId, email);

    const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.updateRefreshToken(userId, hashedRefresh);

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return { access_token: tokens.access_token };
  }

  async logout(userId: number, res: any) {
    await this.usersService.updateRefreshToken(userId, null);
    res.clearCookie('refresh_token');
    return { message: 'Logout correcto' };
  }
}
