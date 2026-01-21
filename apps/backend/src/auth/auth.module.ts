import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { RtStrategy } from './jwt-refresh.strategy';

// ✅ AÑADIDOS
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetEntity } from './password-reset.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule,

    // ✅ AÑADIDO: MailService para enviar el email de reset
    MailModule,

    // ✅ AÑADIDO: repositorio para la tabla password_resets
    TypeOrmModule.forFeature([PasswordResetEntity]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RtStrategy],
})
export class AuthModule {}
