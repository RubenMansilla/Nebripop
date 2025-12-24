"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("./wallet.entity");
let WalletService = class WalletService {
    walletRepo;
    constructor(walletRepo) {
        this.walletRepo = walletRepo;
    }
    async getBalance(userId) {
        let wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) {
            wallet = this.walletRepo.create({ userId, balance: 0 });
            await this.walletRepo.save(wallet);
        }
        return { ...wallet, balance: Number(wallet.balance) };
    }
    async deposit(userId, amount) {
        if (amount <= 0)
            throw new common_1.BadRequestException('La cantidad debe ser positiva');
        const wallet = await this.getBalance(userId);
        const newBalance = Number(wallet.balance) + Number(amount);
        await this.walletRepo.update({ userId }, { balance: newBalance });
        return this.getBalance(userId);
    }
    async withdraw(userId, amount) {
        if (amount <= 0)
            throw new common_1.BadRequestException('La cantidad debe ser positiva');
        const wallet = await this.getBalance(userId);
        const currentBalance = Number(wallet.balance);
        if (currentBalance < amount) {
            throw new common_1.BadRequestException('Fondos insuficientes');
        }
        const newBalance = currentBalance - amount;
        await this.walletRepo.update({ userId }, { balance: newBalance });
        return this.getBalance(userId);
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WalletService);
//# sourceMappingURL=wallet.service.js.map