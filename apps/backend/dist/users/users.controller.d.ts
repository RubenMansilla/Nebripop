import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getUser(id: string): Promise<{
        id: number;
        email: string;
        passwordHash: string;
        refreshToken: string | null;
    } | null>;
}
