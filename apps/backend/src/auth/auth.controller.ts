import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import { JwtAccessGuard } from '../common/guards/jwt-access.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res,
  ) {
    return this.authService.login(body.email, body.password, res);
  }

  @UseGuards(JwtAccessGuard)
  @Post('me')
  me(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.refresh(req.user.sub, req.user.email, res);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  logout(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.logout(req.user.sub, res);
  }
}
