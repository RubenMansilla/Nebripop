import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }, res: any): Promise<{
        access_token: string;
    }>;
    me(req: any): any;
    refresh(req: any, res: any): Promise<{
        access_token: string;
    }>;
    logout(req: any, res: any): Promise<{
        message: string;
    }>;
}
