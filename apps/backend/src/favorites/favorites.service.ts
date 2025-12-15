import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FavoriteProduct } from "./favorite-product.entity";

@Injectable()
export class FavoritesService {

    constructor(
        @InjectRepository(FavoriteProduct)
        private favoritesRepo: Repository<FavoriteProduct>
    ) {}

    async addFavorite(userId: number, productId: number) {
        return await this.favoritesRepo.save({
            user_id: userId,
            product_id: productId,
        });
    }

    async removeFavorite(userId: number, productId: number) {
        return await this.favoritesRepo.delete({
            user_id: userId,
            product_id: productId,
        });
    }

    async isFavorite(userId: number, productId: number) {
        return await this.favoritesRepo.findOne({
            where: { user_id: userId, product_id: productId }
        });
    }

    // ⭐ ESTA ES LA ÚNICA PARTE NUEVA
    async getFavoriteProducts(userId: number) {
        return await this.favoritesRepo.query(`
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
}
