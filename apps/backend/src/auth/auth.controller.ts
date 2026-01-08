import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() data: RegisterDto) {
        return this.authService.register(data);
    }

    @Post('login')
    login(@Body() data: LoginDto) {
        return this.authService.login(data);
    }

    // Endpoint para renovar sesión
    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    refresh(@Req() req) {
        const userId = req.user['sub'];
        const refreshToken = req.user['refreshToken'];
        return this.authService.refreshTokens(userId, refreshToken);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    logout(@Req() req) {
        this.authService.logout(req.user['sub']);
    }
}