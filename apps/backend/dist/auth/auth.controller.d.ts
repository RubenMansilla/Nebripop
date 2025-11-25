import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
export declare class AuthController {
    private readonly authService;
    private readonly captchaService;
    constructor(authService: AuthService, captchaService: CaptchaService);
    login(body: any): Promise<{
        message: string;
        email: string;
    }>;
}
