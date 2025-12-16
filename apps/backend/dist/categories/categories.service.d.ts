import { Repository } from "typeorm";
import { Category } from "./categories.entity";
export declare class CategoriesService {
    private categoriesRepo;
    constructor(categoriesRepo: Repository<Category>);
    findAll(): Promise<Category[]>;
}
