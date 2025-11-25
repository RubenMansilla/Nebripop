import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwt;
    constructor(usersService: UsersService, jwt: JwtService);
    register(data: RegisterDto): Promise<{
        user: import("../users/users.entity").User;
        token: string;
    }>;
    login(data: LoginDto): Promise<{
        user: {
            id: number;
            fullName: string;
            email: string;
        };
        token: string;
    }>;
}
