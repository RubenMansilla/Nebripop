"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    jwt;
    usersService;
    constructor(jwt, usersService) {
        this.jwt = jwt;
        this.usersService = usersService;
    }
    async validateUser(email, password) {
        console.log("EMAIL RECIBIDO:", email);
        const user = await this.usersService.findByEmail(email);
        console.log("USUARIO ENCONTRADO:", user);
        if (!user) {
            console.log("❌ NO EXISTE EL USUARIO CON ESE EMAIL");
            throw new common_1.UnauthorizedException('Email o contraseña incorrectos');
        }
        const passValid = await bcrypt.compare(password, user.passwordHash);
        console.log("PASSWORD RECIBIDO:", password);
        console.log("HASH EN BD:", user.passwordHash);
        console.log("¿PASSWORD CORRECTA?:", passValid);
        if (!passValid) {
            console.log("❌ CONTRASEÑA INCORRECTA");
            throw new common_1.UnauthorizedException('Email o contraseña incorrectos');
        }
        console.log("✔ LOGIN CORRECTO");
        return user;
    }
    async login(email, password, res) {
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
    generateTokens(userId, email) {
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
    async refresh(userId, email, res) {
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
    async logout(userId, res) {
        await this.usersService.updateRefreshToken(userId, null);
        res.clearCookie('refresh_token');
        return { message: 'Logout correcto' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map