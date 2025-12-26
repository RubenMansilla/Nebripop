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
const typeorm_3 = require("typeorm");
const review_entity_1 = require("../reviews/review.entity");
let ProductsService = class ProductsService {
    productRepo;
    productImagesRepo;
    favoritesRepo;
    chatRepo;
    purchaseRepo;
    reviewRepo;
    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
    constructor(productRepo, productImagesRepo, favoritesRepo, chatRepo, purchaseRepo, reviewRepo) {
        this.productRepo = productRepo;
        this.productImagesRepo = productImagesRepo;
        this.favoritesRepo = favoritesRepo;
        this.chatRepo = chatRepo;
        this.purchaseRepo = purchaseRepo;
        this.reviewRepo = reviewRepo;
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
        const product = await this.productRepo.save({
            ...dto,
            owner_id: userId,
        });
        if (files?.length) {
            await this.uploadImages(files, product.id);
        }
        return { productId: product.id };
    }
    async getActiveProductsByUser(userId) {
        const products = await this.productRepo.find({
            where: { owner_id: userId, sold: false },
            relations: ["images"],
            order: { id: "DESC" },
        });
        const favorites = await this.favoritesRepo.find({
            where: { user_id: userId },
        });
        const favoriteIds = favorites.map((f) => f.product_id);
        return products.map((p) => ({
            ...p,
            isFavorite: favoriteIds.includes(p.id),
        }));
    }
    async getPublicProductsByUser(userId) {
        return this.productRepo.find({
            where: { owner_id: userId, sold: false },
            relations: ["images"],
            order: { id: "DESC" },
        });
    }
    async getAllProducts(userId, categoryId, subcategoryId, minPrice, maxPrice, dateFilter) {
        const where = {};
        if (userId) {
            where.owner_id = (0, typeorm_2.Not)(userId);
        }
        if (categoryId) {
            where.category_id = Number(categoryId);
        }
        if (subcategoryId) {
            where.subcategory_id = Number(subcategoryId);
        }
        if (minPrice !== undefined && maxPrice !== undefined) {
            where.price = (0, typeorm_3.Between)(Number(minPrice), Number(maxPrice));
        }
        if (dateFilter) {
            const now = new Date();
            let from;
            if (dateFilter === "today") {
                from = new Date();
                from.setHours(0, 0, 0, 0);
            }
            else if (dateFilter === "7days") {
                from = new Date(now.setDate(now.getDate() - 7));
            }
            else {
                from = new Date(now.setDate(now.getDate() - 30));
            }
            where.createdAt = (0, typeorm_3.MoreThan)(from);
        }
        return this.productRepo.find({
            where,
            relations: ["images"],
            order: { createdAt: "DESC" },
        });
    }
    async getProductById(productId, userId) {
        const product = await this.productRepo
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.images", "images")
            .leftJoinAndSelect("product.category", "category")
            .leftJoinAndSelect("product.subcategory", "subcategory")
            .leftJoin("product.seller", "seller")
            .addSelect([
            "seller.id",
            "seller.full_name",
            "seller.full_name",
        ])
            .where("product.id = :productId", { productId })
            .getOne();
        if (!product) {
            throw new common_1.NotFoundException("Producto no encontrado");
        }
        return product;
    }
    async deleteProduct(productId, userId) {
        const product = await this.productRepo.findOne({
            where: { id: productId },
        });
        if (!product)
            throw new common_1.NotFoundException("Producto no encontrado");
        if (product.owner_id !== userId)
            throw new common_1.UnauthorizedException("No tienes permiso");
        if (product.sold)
            throw new common_1.BadRequestException("No puedes eliminar un producto vendido");
        const chatCount = await this.chatRepo.count({
            where: { productId },
        });
        if (chatCount > 0) {
            await this.productRepo.softDelete(productId);
            return { message: "Producto archivado (Soft Delete)" };
        }
        await this.favoritesRepo.delete({ product_id: productId });
        const images = await this.productImagesRepo.find({
            where: { product_id: productId },
        });
        if (images.length) {
            const paths = images.map((img) => img.image_url);
            await this.supabase.storage.from("productsimg").remove(paths);
            await this.productImagesRepo.remove(images);
        }
        await this.productRepo.delete(productId);
        return { message: "Producto eliminado permanentemente" };
    }
    async getPurchasedProductsByUser(userId) {
        const purchases = await this.purchaseRepo.find({
            where: { buyerId: userId, deletedByBuyer: false },
            relations: ["product", "product.images"],
            order: { purchasedAt: "DESC" },
        });
        return purchases.map((p) => ({
            ...p.product,
            purchaseId: p.id,
            soldPrice: p.price,
            soldDate: p.purchasedAt,
        }));
    }
    async getBuyingProcessProducts(userId) {
        const products = await this.productRepo
            .createQueryBuilder("product")
            .innerJoin("chats", "chat", "chat.product_id = product.id")
            .leftJoinAndSelect("product.images", "images")
            .where("chat.buyer_id = :userId", { userId })
            .andWhere("product.sold = false")
            .distinct(true)
            .getMany();
        if (products.length === 0)
            return [];
        const favorites = await this.favoritesRepo.find({
            where: { user_id: userId },
        });
        const favoriteIds = favorites.map((f) => f.product_id);
        return products.map((p) => ({
            ...p,
            isFavorite: favoriteIds.includes(p.id),
        }));
    }
    async getSellingProcessProducts(userId) {
        return this.productRepo
            .createQueryBuilder("product")
            .innerJoin("chats", "chat", "chat.product_id = product.id")
            .leftJoinAndSelect("product.images", "images")
            .where("chat.seller_id = :userId", { userId })
            .andWhere("product.sold = false")
            .distinct(true)
            .getMany();
    }
    async getSoldProductsByUser(userId) {
        const purchases = await this.purchaseRepo.find({
            where: {
                sellerId: userId,
                deletedBySeller: false,
            },
            relations: ['product', 'product.images'],
            order: { purchasedAt: 'DESC' },
        });
        return purchases.map(p => ({
            ...p.product,
            purchaseId: p.id,
            soldPrice: p.price,
            soldDate: p.purchasedAt,
        }));
    }
    async incrementViews(productId) {
        return this.productRepo.increment({ id: productId }, 'views_count', 1);
    }
    async getTopSuccessfulProducts(userId) {
        const products = await this.productRepo.createQueryBuilder('product')
            .leftJoinAndSelect('product.images', 'images')
            .where('product.owner_id = :userId', { userId })
            .loadRelationCountAndMap('product.favoritesCount', 'product.favorites')
            .loadRelationCountAndMap('product.chatsCount', 'product.chats')
            .orderBy('product.views_count', 'DESC')
            .take(2)
            .getMany();
        return products.map((p) => ({
            id: p.id,
            name: p.name,
            created_at: p.createdAt,
            price: p.price,
            views_count: p.views_count,
            first_img: p.images && p.images.length > 0 ? p.images[0].image_url : null,
            total_favorites: p['favoritesCount'] || 0,
            total_chats: p['chatsCount'] || 0,
        }));
    }
    async getFinancialStats(userId, range) {
        const now = new Date();
        let startDate = new Date();
        let sqlFormat = '';
        let jsStep = '';
        let displayFormat = '';
        if (range === 'week') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
            sqlFormat = 'YYYY-MM-DD';
            jsStep = 'day';
            displayFormat = 'weekday';
        }
        else if (range === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            sqlFormat = 'YYYY-MM-DD';
            jsStep = 'day';
            displayFormat = 'day-month';
        }
        else {
            startDate = new Date(now.getFullYear(), 0, 1);
            sqlFormat = 'YYYY-MM';
            jsStep = 'month';
            displayFormat = 'month';
        }
        const dataMap = new Map();
        const currentDateIterator = new Date(startDate);
        while (currentDateIterator <= now) {
            let key = '';
            let label = '';
            if (jsStep === 'month') {
                const month = (currentDateIterator.getMonth() + 1).toString().padStart(2, '0');
                key = `${currentDateIterator.getFullYear()}-${month}`;
                label = currentDateIterator.toLocaleString('es-ES', { month: 'short' });
                currentDateIterator.setMonth(currentDateIterator.getMonth() + 1);
            }
            else {
                const month = (currentDateIterator.getMonth() + 1).toString().padStart(2, '0');
                const day = currentDateIterator.getDate().toString().padStart(2, '0');
                key = `${currentDateIterator.getFullYear()}-${month}-${day}`;
                if (displayFormat === 'weekday') {
                    label = currentDateIterator.toLocaleString('es-ES', { weekday: 'short' });
                }
                else {
                    label = `${day} ${currentDateIterator.toLocaleString('es-ES', { month: 'short' })}`;
                }
                currentDateIterator.setDate(currentDateIterator.getDate() + 1);
            }
            label = label.charAt(0).toUpperCase() + label.slice(1);
            dataMap.set(key, {
                name: label,
                ingresos: 0,
                gastos: 0,
                ventas: 0,
                reviews: 0
            });
        }
        const incomeRaw = await this.purchaseRepo.createQueryBuilder('purchase')
            .select(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`, 'dateKey')
            .addSelect('SUM(purchase.price)', 'amount')
            .where('purchase.sellerId = :userId', { userId })
            .andWhere('purchase.purchasedAt >= :startDate', { startDate })
            .groupBy(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`)
            .getRawMany();
        const expensesRaw = await this.purchaseRepo.createQueryBuilder('purchase')
            .select(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`, 'dateKey')
            .addSelect('SUM(purchase.price)', 'amount')
            .where('purchase.buyerId = :userId', { userId })
            .andWhere('purchase.purchasedAt >= :startDate', { startDate })
            .groupBy(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`)
            .getRawMany();
        const salesRaw = await this.productRepo.createQueryBuilder('product')
            .select(`TO_CHAR(product.created_at, '${sqlFormat}')`, 'dateKey')
            .addSelect('COUNT(product.id)', 'count')
            .where('product.owner_id = :userId', { userId })
            .andWhere('product.sold = true')
            .andWhere('product.created_at >= :startDate', { startDate })
            .groupBy(`TO_CHAR(product.created_at, '${sqlFormat}')`)
            .getRawMany();
        const reviewsRaw = await this.reviewRepo.createQueryBuilder('review')
            .select(`TO_CHAR(review.created_at, '${sqlFormat}')`, 'dateKey')
            .addSelect('COUNT(review.id)', 'count')
            .where('review.reviewed_user_id = :userId', { userId })
            .andWhere('review.created_at >= :startDate', { startDate })
            .groupBy(`TO_CHAR(review.created_at, '${sqlFormat}')`)
            .getRawMany();
        const viewsRaw = await this.productRepo.createQueryBuilder('product')
            .select('SUM(product.views_count)', 'total')
            .where('product.owner_id = :userId', { userId })
            .getRawOne();
        const totalGlobalViews = Number(viewsRaw.total) || 0;
        const fillData = (items, field) => {
            items.forEach(item => {
                const key = item.dateKey;
                if (dataMap.has(key)) {
                    const entry = dataMap.get(key);
                    const val = parseFloat(item.amount || item.count);
                    entry[field] = val || 0;
                }
            });
        };
        fillData(incomeRaw, 'ingresos');
        fillData(expensesRaw, 'gastos');
        fillData(salesRaw, 'ventas');
        fillData(reviewsRaw, 'reviews');
        const chartData = Array.from(dataMap.values());
        return {
            chartData,
            meta: {
                totalViews: totalGlobalViews
            }
        };
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
    __param(5, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map