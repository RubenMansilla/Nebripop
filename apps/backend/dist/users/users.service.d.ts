import { Repository } from 'typeorm';
import { User } from './users.entity';
export declare class UsersService {
    private repo;
    constructor(repo: Repository<User>);
    create(data: Partial<User>): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
}
