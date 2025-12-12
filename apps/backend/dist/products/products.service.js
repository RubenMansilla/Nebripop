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
const typeorm_3 = require("typeorm");
const sharp_1 = __importDefault(require("sharp"));
let ProductsService = class ProductsService {
    productRepo;
    productImagesRepo;
    favoritesRepo;
    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
    constructor(productRepo, productImagesRepo, favoritesRepo) {
        this.productRepo = productRepo;
        this.productImagesRepo = productImagesRepo;
        this.favoritesRepo = favoritesRepo;
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
        const urls = await Promise.all(tasks);
        return urls;
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
    async getSoldProductsByUser(userId) {
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
    async getAllProducts(userId) {
        const whereClause = userId
            ? { owner_id: (0, typeorm_3.Not)(userId) }
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
            throw new Error("No puedes ver tus propios productos en la página de detalle");
        }
        return product;
    }
    async deleteProduct(productId) {
        const productImages = await this.productImagesRepo.find({
            where: { product_id: productId },
        });
        for (const image of productImages) {
            const { error } = await this.supabase.storage
                .from('productsimg')
                .remove([image.image_url]);
            if (error) {
                throw new Error(`Error al eliminar la imagen: ${error.message}`);
            }
        }
        const deleteResult = await this.productRepo.delete(productId);
        if (deleteResult.affected === 0) {
            throw new Error('No se encontró el producto para eliminar.');
        }
        return { message: 'Producto eliminado correctamente' };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(products_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(products_image_entity_1.ProductImage)),
    __param(2, (0, typeorm_1.InjectRepository)(favorite_product_entity_1.FavoriteProduct)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map