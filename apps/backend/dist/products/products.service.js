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
        const urls = [];
        for (const file of files) {
            const path = `${productId}/${(0, uuid_1.v4)()}-${file.originalname}`;
            const { error } = await this.supabase.storage
                .from("productsimg")
                .upload(path, file.buffer, {
                contentType: file.mimetype,
            });
            if (error)
                throw error;
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