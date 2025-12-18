import { Repository } from "typeorm";
import { FavoriteProduct } from "./favorite-product.entity";
import { FavoriteUser } from "./favorite-user.entity";
export declare class FavoritesService {
    private favoritesProductRepo;
    private favoritesUserRepo;
    constructor(favoritesProductRepo: Repository<FavoriteProduct>, favoritesUserRepo: Repository<FavoriteUser>);
    addFavorite(userId: number, productId: number): Promise<{
        user_id: number;
        product_id: number;
    } & FavoriteProduct>;
    removeFavorite(userId: number, productId: number): Promise<import("typeorm").DeleteResult>;
    getFavoriteProducts(userId: number): Promise<any>;
    addFavoriteUser(userId: number, favoriteUserId: number): Promise<{
        user_id: number;
        favorite_user_id: number;
    } & FavoriteUser>;
    removeFavoriteUser(userId: number, favoriteUserId: number): Promise<import("typeorm").DeleteResult>;
    getFavoriteUsers(userId: number): Promise<any>;
    isFavoriteUser(userId: number, favoriteUserId: number): Promise<boolean>;
}
