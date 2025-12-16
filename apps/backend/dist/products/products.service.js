"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const products_entity_1 = require("./products.entity");
const products_image_entity_1 = require("./products-image.entity");
const supabase_js_1 = require("@supabase/supabase-js");
const uuid_1 = require("uuid");
const favorite_product_entity_1 = require("../favorites/favorite-product.entity");
const chat_entity_1 = require("../chat/chat.entity");
const purchase_entity_1 = require("../purchases/purchase.entity");
const sharp_1 = __importDefault(require("sharp"));
let ProductsService = class ProductsService {
    productRepo;
    productImagesRepo;
    favoritesRepo;
    chatRepo;
    purchaseRepo;
    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
    constructor(productRepo, productImagesRepo, favoritesRepo, chatRepo, purchaseRepo) {
        this.productRepo = productRepo;
        this.productImagesRepo = productImagesRepo;
        this.favoritesRepo = favoritesRepo;
        this.chatRepo = chatRepo;
        this.purchaseRepo = purchaseRepo;
    }
    async uploadImages(files, productId) {
        const tasks = files.map(async (file) => {
            const processed = await (0, sharp_1.default)(file.buffer)
                .resize(1400, 1400, { fit: "inside" })
                .webp({ quality: 80 })
                .toBuffer();
            const filePath = `${productId}/${(0, uuid_1.v4)()}.webp`;
            const { error } = await this.supabase.storage
                .from("productsimg")
                .upload(filePath, processed, {
                contentType: "image/webp",
                upsert: true,
            });
            if (error)
                throw error;
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
    async createProduct(dto, files, userId) {
        try {
            const product = await this.productRepo.save({
                ...dto,
                owner_id: userId,
            });
            if (files && files.length > 0) {
                await this.uploadImages(files, product.id);
            }
            return { productId: product.id };
        }
        catch (err) {
            console.error("ERROR BACKEND:", err);
            throw err;
        }
    }
    async getActiveProductsByUser(userId) {
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
    async getPublicProductsByUser(userId) {
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
    async getSoldProductsByUser(userId) {
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
    async getAllProducts(userId) {
        const whereClause = userId
            ? { owner_id: (0, typeorm_2.Not)(userId) }
            : {};
        return this.productRepo.find({
            where: whereClause,
            relations: ["images"],
            order: { id: "DESC" }
        });
    }
    async getProductById(productId, userId) {
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
    async deleteProduct(productId, userId) {
        const product = await this.productRepo.findOne({
            where: { id: productId }
        });
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        if (product.owner_id !== userId) {
            throw new common_1.UnauthorizedException('No tienes permiso');
        }
        if (product.sold) {
            throw new common_1.BadRequestException('No puedes eliminar un producto vendido');
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
    async getPurchasedProductsByUser(userId) {
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
    async getBuyingProcessProducts(userId) {
        return this.productRepo
            .createQueryBuilder('product')
            .innerJoin('chats', 'chat', 'chat.product_id = product.id')
            .leftJoinAndSelect('product.images', 'images')
            .where('chat.buyer_id = :userId', { userId })
            .andWhere('product.sold = false')
            .distinct(true)
            .getMany();
    }
    async getSellingProcessProducts(userId) {
        return this.productRepo
            .createQueryBuilder('product')
            .innerJoin('chats', 'chat', 'chat.product_id = product.id')
            .leftJoinAndSelect('product.images', 'images')
            .where('chat.seller_id = :userId', { userId })
            .andWhere('product.sold = false')
            .distinct(true)
            .getMany();
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(products_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(products_image_entity_1.ProductImage)),
    __param(2, (0, typeorm_1.InjectRepository)(favorite_product_entity_1.FavoriteProduct)),
    __param(3, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __param(4, (0, typeorm_1.InjectRepository)(purchase_entity_1.Purchase)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map