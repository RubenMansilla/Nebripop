import { Repository } from "typeorm";
import { FavoriteProduct } from "./favorite-product.entity";
export declare class FavoritesService {
    private favoritesRepo;
    constructor(favoritesRepo: Repository<FavoriteProduct>);
    addFavorite(userId: number, productId: number): Promise<{
        user_id: number;
        product_id: number;
    } & FavoriteProduct>;
    removeFavorite(userId: number, productId: number): Promise<import("typeorm").DeleteResult>;
    isFavorite(userId: number, productId: number): Promise<FavoriteProduct | null>;
    getFavoriteProducts(userId: number): Promise<any>;
}
