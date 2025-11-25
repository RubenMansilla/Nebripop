export declare class AuthService {
    login(email: string, password: string): Promise<{
        message: string;
        email: string;
    }>;
}
