import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(JwtStrategy, 'jwt-access') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    } as any); // <-- FIX: evita errores de tipos
  }

  async validate(payload: any) {
    return payload; // req.user = payload
  }
}
