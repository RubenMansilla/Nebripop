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
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const favorite_product_entity_1 = require("./favorite-product.entity");
const favorite_user_entity_1 = require("./favorite-user.entity");
let FavoritesService = class FavoritesService {
    favoritesProductRepo;
    favoritesUserRepo;
    constructor(favoritesProductRepo, favoritesUserRepo) {
        this.favoritesProductRepo = favoritesProductRepo;
        this.favoritesUserRepo = favoritesUserRepo;
    }
    addFavorite(userId, productId) {
        return this.favoritesProductRepo.save({
            user_id: userId,
            product_id: productId,
        });
    }
    removeFavorite(userId, productId) {
        return this.favoritesProductRepo.delete({
            user_id: userId,
            product_id: productId,
        });
    }
    async getFavoriteProducts(userId) {
        return this.favoritesProductRepo.query(`
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url
            )
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) AS images,
        TRUE AS "isFavorite"
      FROM favorites_products fp
      JOIN products p ON p.id = fp.product_id
      LEFT JOIN product_images pi ON pi.product_id = p.id
      WHERE fp.user_id = $1
      GROUP BY p.id
      ORDER BY p.id DESC;
    `, [userId]);
    }
    async addFavoriteUser(userId, favoriteUserId) {
        if (userId === favoriteUserId) {
            throw new common_1.BadRequestException("No puedes marcarte como favorito");
        }
        const exists = await this.favoritesUserRepo.findOne({
            where: { user_id: userId, favorite_user_id: favoriteUserId }
        });
        if (exists) {
            throw new common_1.BadRequestException("El usuario ya está en favoritos");
        }
        return this.favoritesUserRepo.save({
            user_id: userId,
            favorite_user_id: favoriteUserId,
        });
    }
    removeFavoriteUser(userId, favoriteUserId) {
        return this.favoritesUserRepo.delete({
            user_id: userId,
            favorite_user_id: favoriteUserId,
        });
    }
    async getFavoriteUsers(userId) {
        return this.favoritesUserRepo.query(`
      SELECT 
        u.id,
        u.full_name,
        u.profile_picture,
        TRUE AS "isFavorite"
      FROM favorites_users fu
      JOIN users u ON u.id = fu.favorite_user_id
      WHERE fu.user_id = $1
      ORDER BY u.full_name;
    `, [userId]);
    }
    async isFavoriteUser(userId, favoriteUserId) {
        const fav = await this.favoritesUserRepo.findOne({
            where: { user_id: userId, favorite_user_id: favoriteUserId }
        });
        return !!fav;
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(favorite_product_entity_1.FavoriteProduct)),
    __param(1, (0, typeorm_1.InjectRepository)(favorite_user_entity_1.FavoriteUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map