import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { Product } from "./products.entity";
import { ProductImage } from "./products-image.entity";
import { CreateProductDto } from "./create-products.dto";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { FavoriteProduct } from "../favorites/favorite-product.entity";
import { Chat } from "../chat/chat.entity";
import { Purchase } from "../purchases/purchase.entity";
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

        @InjectRepository(Chat)
        private chatRepo: Repository<Chat>,

        @InjectRepository(Purchase)
        private purchaseRepo: Repository<Purchase>,
    ) { }

    // ============================
    // SUBIDA Y PROCESADO DE IMÁGENES
    // ============================
    async uploadImages(files: Express.Multer.File[], productId: number) {
        const tasks = files.map(async (file) => {

            const processed = await sharp(file.buffer)
                .resize(1400, 1400, { fit: "inside" })
                .webp({ quality: 80 })
                .toBuffer();

            const filePath = `${productId}/${uuidv4()}.webp`;

            const { error } = await this.supabase.storage
                .from("productsimg")
                .upload(filePath, processed, {
                    contentType: "image/webp",
                    upsert: true,
                });

            if (error) throw error;

            const { data } = this.supabase.storage
                .from("productsimg")
                .getPublicUrl(filePath);

            await this.productImagesRepo.save({
                product_id: productId,
                image_url: data.publicUrl,
            });

            return data.publicUrl;
        });

        return Promise.all(tasks);
    }

    // ============================
    // CREAR PRODUCTO
    // ============================
    async createProduct(
        dto: CreateProductDto,
        files: Express.Multer.File[],
        userId: number
    ) {
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

    // ============================
    // PRODUCTOS ACTIVOS DEL USUARIO
    // ============================
    async getActiveProductsByUser(userId: number) {
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

        const favorites = await this.favoritesRepo.find({
            where: { user_id: userId }
        });

        const favoriteProductIds = favorites.map(f => f.product_id);

        return products.map(p => ({
            ...p,
            isFavorite: favoriteProductIds.includes(p.id)
        }));
    }

    // ============================
    // 🔓 PERFIL PÚBLICO (NUEVO)
    // ============================
    async getPublicProductsByUser(userId: number) {
        return this.productRepo.find({
            where: {
                owner_id: userId,
                sold: false
            },
            relations: ['images'],
            order: {
                id: 'DESC'
            }
        });
    }

    // ============================
    // MIS VENTAS FINALIZADAS
    // ============================
    async getSoldProductsByUser(userId: number) {
        const purchases = await this.purchaseRepo.find({
            where: {
                sellerId: userId,
                deletedBySeller: false
            },
            relations: ['product', 'product.images'],
            order: { purchasedAt: 'DESC' }
        });

        return purchases.map(p => ({
            ...p.product,
            purchaseId: p.id,
            soldPrice: p.price,
            soldDate: p.purchasedAt
        }));
    }

    // ============================
    // OBTENER TODOS LOS PRODUCTOS
    // ============================
    async getAllProducts(userId?: number) {
        const whereClause = userId
            ? { owner_id: Not(userId) }
            : {};

        return this.productRepo.find({
            where: whereClause,
            relations: ["images"],
            order: { id: "DESC" }
        });
    }

    // ============================
    // DETALLE DE PRODUCTO
    // ============================
    async getProductById(productId: number, userId: number | null) {
        const product = await this.productRepo.findOne({
            where: { id: productId },
            relations: ["images"],
        });

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        if (product.owner_id === userId) {
            throw new Error("No puedes ver tus propios productos");
        }

        return product;
    }

    // ============================
    // ELIMINAR PRODUCTO
    // ============================
    async deleteProduct(productId: number, userId: number) {
        const product = await this.productRepo.findOne({
            where: { id: productId }
        });

        if (!product) {
            throw new NotFoundException('Producto no encontrado');
        }

        if (product.owner_id !== userId) {
            throw new UnauthorizedException('No tienes permiso');
        }

        if (product.sold) {
            throw new BadRequestException(
                'No puedes eliminar un producto vendido'
            );
        }

        const chatCount = await this.chatRepo.count({
            where: { productId }
        });

        if (chatCount > 0) {
            await this.productRepo.softDelete(productId);
            return {
                message: 'Producto archivado (Soft Delete)'
            };
        }

        await this.favoritesRepo.delete({
            product_id: productId
        });

        const productImages = await this.productImagesRepo.find({
            where: { product_id: productId }
        });

        if (productImages.length > 0) {
            const paths = productImages.map(img => img.image_url);

            const { error } = await this.supabase.storage
                .from('productsimg')
                .remove(paths);

            if (error) {
                console.error("Error borrando imágenes:", error);
            }

            await this.productImagesRepo.remove(productImages);
        }

        await this.productRepo.delete(productId);

        return {
            message: 'Producto eliminado permanentemente'
        };
    }

    // ============================
    // MIS COMPRAS FINALIZADAS
    // ============================
    async getPurchasedProductsByUser(userId: number) {
        const purchases = await this.purchaseRepo.find({
            where: {
                buyerId: userId,
                deletedByBuyer: false
            },
            relations: ['product', 'product.images'],
            order: { purchasedAt: 'DESC' }
        });

        return purchases.map(p => ({
            ...p.product,
            purchaseId: p.id,
            soldPrice: p.price,
            soldDate: p.purchasedAt
        }));
    }

    // ============================
    // EN PROCESO DE COMPRA
    // ============================
    async getBuyingProcessProducts(userId: number) {
        return this.productRepo
            .createQueryBuilder('product')
            .innerJoin('chats', 'chat', 'chat.product_id = product.id')
            .leftJoinAndSelect('product.images', 'images')
            .where('chat.buyer_id = :userId', { userId })
            .andWhere('product.sold = false')
            .distinct(true)
            .getMany();
    }

    // ============================
    // EN PROCESO DE VENTA
    // ============================
    async getSellingProcessProducts(userId: number) {
        return this.productRepo
            .createQueryBuilder('product')
            .innerJoin('chats', 'chat', 'chat.product_id = product.id')
            .leftJoinAndSelect('product.images', 'images')
            .where('chat.seller_id = :userId', { userId })
            .andWhere('product.sold = false')
            .distinct(true)
            .getMany();
    }
}
