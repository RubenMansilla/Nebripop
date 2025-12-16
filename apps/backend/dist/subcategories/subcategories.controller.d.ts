import { SubcategoriesService } from "./subcategories.service";
export declare class SubcategoriesController {
    private readonly subcategoriesService;
    constructor(subcategoriesService: SubcategoriesService);
    getByCategory(categoryId: number): Promise<import("./subcategories.entity").Subcategory[]>;
}
