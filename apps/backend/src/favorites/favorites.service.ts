import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FavoriteProduct } from "./favorite-product.entity";
import { FavoriteUser } from "./favorite-user.entity";

@Injectable()
export class FavoritesService {

  constructor(
    @InjectRepository(FavoriteProduct)
    private favoritesProductRepo: Repository<FavoriteProduct>,

    @InjectRepository(FavoriteUser)
    private favoritesUserRepo: Repository<FavoriteUser>,
  ) {}

  /* ================= PRODUCTOS ================= */

  addFavorite(userId: number, productId: number) {
    return this.favoritesProductRepo.save({
      user_id: userId,
      product_id: productId,
    });
  }

  removeFavorite(userId: number, productId: number) {
    return this.favoritesProductRepo.delete({
      user_id: userId,
      product_id: productId,
    });
  }

  async getFavoriteProducts(userId: number) {
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

  /* ================= USUARIOS ================= */

  async addFavoriteUser(userId: number, favoriteUserId: number) {
    if (userId === favoriteUserId) {
      throw new BadRequestException("No puedes marcarte como favorito");
    }

    const exists = await this.favoritesUserRepo.findOne({
      where: { user_id: userId, favorite_user_id: favoriteUserId }
    });

    if (exists) {
      throw new BadRequestException("El usuario ya está en favoritos");
    }

    return this.favoritesUserRepo.save({
      user_id: userId,
      favorite_user_id: favoriteUserId,
    });
  }

  removeFavoriteUser(userId: number, favoriteUserId: number) {
    return this.favoritesUserRepo.delete({
      user_id: userId,
      favorite_user_id: favoriteUserId,
    });
  }

  async getFavoriteUsers(userId: number) {
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

  async isFavoriteUser(userId: number, favoriteUserId: number) {
    const fav = await this.favoritesUserRepo.findOne({
      where: { user_id: userId, favorite_user_id: favoriteUserId }
    });

    return !!fav;
  }
}
