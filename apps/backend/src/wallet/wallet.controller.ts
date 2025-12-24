import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get('balance')
    getBalance(@Req() req) {
        return this.walletService.getBalance(req.user.id);
    }

    @Post('deposit')
    deposit(@Req() req, @Body() body: { amount: number }) {
        return this.walletService.deposit(req.user.id, body.amount);
    }

    @Post('withdraw')
    withdraw(@Req() req, @Body() body: { amount: number }) {
        return this.walletService.withdraw(req.user.id, body.amount);
    }
}