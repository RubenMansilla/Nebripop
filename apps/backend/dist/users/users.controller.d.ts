import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    updateUser(req: any, body: any): Promise<import("./users.entity").User | null>;
    uploadProfilePicture(file: Express.Multer.File, req: any): Promise<import("./users.entity").User | null>;
}
