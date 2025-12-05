import { Repository } from "typeorm";
import { Product } from "./products.entity";
import { ProductImage } from "./products-image.entity";
import { CreateProductDto } from "./create-products.dto";
export declare class ProductsService {
    private productRepo;
    private productImagesRepo;
    private supabase;
    constructor(productRepo: Repository<Product>, productImagesRepo: Repository<ProductImage>);
    uploadImages(files: Express.Multer.File[], productId: number): Promise<string[]>;
    createProduct(dto: CreateProductDto, files: Express.Multer.File[], userId: number): Promise<{
        productId: number;
    }>;
}
