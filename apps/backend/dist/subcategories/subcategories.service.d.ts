import { Repository } from "typeorm";
import { Subcategory } from "./subcategories.entity";
export declare class SubcategoriesService {
    private readonly subcategoriesRepository;
    constructor(subcategoriesRepository: Repository<Subcategory>);
    getByCategory(categoryId: number): Promise<Subcategory[]>;
}
