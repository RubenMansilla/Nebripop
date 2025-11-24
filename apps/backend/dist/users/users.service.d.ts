import { PrismaService } from '../prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(email: string, password: string): Promise<{
        id: number;
        email: string;
        passwordHash: string;
        refreshToken: string | null;
    }>;
    findByEmail(email: string): Promise<{
        id: number;
        email: string;
        passwordHash: string;
        refreshToken: string | null;
    } | null>;
    findById(id: number): Promise<{
        id: number;
        email: string;
        passwordHash: string;
        refreshToken: string | null;
    } | null>;
    updateRefreshToken(id: number, refreshToken: string | null): Promise<{
        id: number;
        email: string;
        passwordHash: string;
        refreshToken: string | null;
    }>;
    clearRefreshToken(id: number): Promise<{
        id: number;
        email: string;
        passwordHash: string;
        refreshToken: string | null;
    }>;
}
