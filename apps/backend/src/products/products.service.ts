import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./products.entity";
import { ProductImage } from "./products-image.entity";
import { CreateProductDto } from "./create-products.dto";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { FavoriteProduct } from "../favorites/favorite-product.entity";
import { Not } from "typeorm";



@Injectable()
export class ProductsService {
    private supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE!
    );

    constructor(
        @InjectRepository(Product)
        private productRepo: Repository<Product>,

        @InjectRepository(ProductImage)
        private productImagesRepo: Repository<ProductImage>,

        @InjectRepository(FavoriteProduct)
        private favoritesRepo: Repository<FavoriteProduct>,

    ) { }

    async uploadImages(files: Express.Multer.File[], productId: number) {
        const urls: string[] = [];

        for (const file of files) {
            const path = `${productId}/${uuidv4()}-${file.originalname}`;

            const { error } = await this.supabase.storage
                .from("productsimg")
                .upload(path, file.buffer, {
                    contentType: file.mimetype,
                });

            if (error) throw error;

            const { data } = this.supabase.storage
                .from("productsimg")
                .getPublicUrl(path);

            urls.push(data.publicUrl);

            await this.productImagesRepo.save({
                product_id: productId,
                image_url: data.publicUrl,
            });
        }

        return urls;
    }
    async createProduct(dto: CreateProductDto, files: Express.Multer.File[], userId: number) {

        try {
            const product = await this.productRepo.save({
                ...dto,
                owner_id: userId,
            });

            if (files && files.length > 0) {
                await this.uploadImages(files, product.id);
            }

            return { productId: product.id };

        } catch (err) {
            console.error("ERROR BACKEND:", err);
            throw err;
        }
    }

    async getActiveProductsByUser(userId: number) {
        // 1. Obtener productos
        const products = await this.productRepo.find({
            where: {
                owner_id: userId,
                sold: false
            },
            relations: ['images'],
            order: {
                id: 'DESC'
            }
        });

        // 2. Obtener lista de favoritos del usuario
        const favorites = await this.favoritesRepo.find({
            where: { user_id: userId }
        });

        const favoriteProductIds = favorites.map(f => f.product_id);

        // 3. Devolver productos + isFavorite
        return products.map(p => ({
            ...p,
            isFavorite: favoriteProductIds.includes(p.id)
        }));
    }

    async getSoldProductsByUser(userId: number) {
        const products = await this.productRepo.find({
            where: {
                owner_id: userId,
                sold: true
            },
            relations: ['images'],
            order: {
                id: 'DESC'
            }
        });

        const favorites = await this.favoritesRepo.find({
            where: { user_id: userId }
        });

        const favoriteProductIds = favorites.map(f => f.product_id);

        return products.map(p => ({
            ...p,
            isFavorite: favoriteProductIds.includes(p.id)
        }));
    }
    
    async getAllProducts(userId?: number) {
    const whereClause = userId
        ? { owner_id: Not(userId) } // excluir productos propios
        : {};

    return this.productRepo.find({
        where: whereClause,
        relations: ["images"],
        order: { id: "DESC" } // ordenar por productos más recientes
    });
}

}

