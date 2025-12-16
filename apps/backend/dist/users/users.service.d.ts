import { Repository } from 'typeorm';
import { User } from './users.entity';
export declare class UsersService {
    private repo;
    private supabase;
    constructor(repo: Repository<User>);
    create(data: Partial<User>): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    updateUser(id: number, data: Partial<User>): Promise<User | null>;
    updateProfilePicture(id: number, file: Express.Multer.File): Promise<User | null>;
    getPublicUser(id: number): Promise<User>;
}
