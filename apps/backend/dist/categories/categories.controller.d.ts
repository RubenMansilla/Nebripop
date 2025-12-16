import { CategoriesService } from "./categories.service";
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getAllCategories(): Promise<import("./categories.entity").Category[]>;
}
