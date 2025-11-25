import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
