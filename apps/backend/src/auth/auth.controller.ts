import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    const { email, password, captcha } = body;

    // 1. Verificar CAPTCHA
    const isValidCaptcha = await this.captchaService.verifyToken(captcha);

    if (!isValidCaptcha) {
      throw new UnauthorizedException('Captcha inválido');
    }

    // 2. Simulación login correcto
    return this.authService.login(email, password);
  }
}
