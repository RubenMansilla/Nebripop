import { FavoritesService } from "./favorites.service";
export declare class FavoritesController {
    private favoritesService;
    constructor(favoritesService: FavoritesService);
    addFavorite(req: any, productId: number): Promise<{
        user_id: number;
        product_id: number;
    } & import("./favorite-product.entity").FavoriteProduct>;
    removeFavorite(req: any, productId: number): Promise<import("typeorm").DeleteResult>;
    getFavoriteProducts(req: any): Promise<any>;
    addFavoriteUser(req: any, userId: number): Promise<{
        user_id: number;
        favorite_user_id: number;
    } & import("./favorite-user.entity").FavoriteUser>;
    removeFavoriteUser(req: any, userId: number): Promise<import("typeorm").DeleteResult>;
    getFavoriteUsers(req: any): Promise<any>;
    isFavoriteUser(req: any, userId: number): Promise<boolean>;
}
