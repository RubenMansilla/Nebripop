import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { FavoriteProduct } from "./favorite-product.entity";

@Injectable()
export class FavoritesService {

    constructor(
        @InjectRepository(FavoriteProduct)
        private favoritesRepo: Repository<FavoriteProduct>
    ) { }

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
}