import { ProductsService } from "./products.service";
import { CreateProductDto } from "./create-products.dto";
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(dto: CreateProductDto, images: Express.Multer.File[], req: any): Promise<{
        productId: number;
    }>;
}
