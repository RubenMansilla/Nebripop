import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private jwt;
    private usersService;
    constructor(jwt: JwtService, usersService: UsersService);
    validateUser(email: string, password: string): Promise<{
        id: number;
        email: string;
        passwordHash: string;
        refreshToken: string | null;
    }>;
    login(email: string, password: string, res: any): Promise<{
        access_token: string;
    }>;
    generateTokens(userId: number, email: string): {
        access_token: string;
        refresh_token: string;
    };
    refresh(userId: number, email: string, res: any): Promise<{
        access_token: string;
    }>;
    logout(userId: number, res: any): Promise<{
        message: string;
    }>;
}
