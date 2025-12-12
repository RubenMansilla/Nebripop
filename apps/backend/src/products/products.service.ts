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
import sharp from "sharp";

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
        const tasks = files.map(async (file) => {
            // Procesar imagen con Sharp
            const processed = await sharp(file.buffer)
                .resize(1400, 1400, { fit: "inside" })  // calidad alta pero ligera
                .webp({ quality: 80 })
                .toBuffer();

            // Nombre único
            const filePath = `${productId}/${uuidv4()}.webp`;

            // Subir a Supabase
            const { error } = await this.supabase.storage
                .from("productsimg")
                .upload(filePath, processed, {
                    contentType: "image/webp",
                    upsert: true,
                });

            if (error) throw error;

            // Obtener URL pública
            const { data } = this.supabase.storage
                .from("productsimg")
                .getPublicUrl(filePath);

            // Guardar en la base de datos
            await this.productImagesRepo.save({
                product_id: productId,
                image_url: data.publicUrl,
            });

            return data.publicUrl;
        });

        // Ejecutar TODAS las subidas en paralelo
        const urls = await Promise.all(tasks);

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

    async getProductById(productId: number, userId: number | null) {
        const product = await this.productRepo.findOne({
            where: { id: productId },
            relations: ["images"], // Including related images
        });

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        // Check if user is trying to view their own product (optional logic)
        if (product.owner_id === userId) {
            throw new Error("No puedes ver tus propios productos en la página de detalle");
        }

        return product;
    }

    async deleteProduct(productId: number) {
        // Obtener las imágenes asociadas a este producto
        const productImages = await this.productImagesRepo.find({
            where: { product_id: productId },
        });

        // Eliminar las imágenes de Supabase
        for (const image of productImages) {
            const { error } = await this.supabase.storage
                .from('productsimg')
                .remove([image.image_url]);

            if (error) {
                throw new Error(`Error al eliminar la imagen: ${error.message}`);
            }
        }

        // Eliminar el producto de la base de datos
        const deleteResult = await this.productRepo.delete(productId);

        if (deleteResult.affected === 0) {
            throw new Error('No se encontró el producto para eliminar.');
        }

        return { message: 'Producto eliminado correctamente' };
    }

}