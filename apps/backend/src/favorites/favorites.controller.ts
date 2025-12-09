import { Controller, Post, Delete, Param, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FavoritesService } from "./favorites.service";

@Controller("favorites")
export class FavoritesController {

    constructor(private favoritesService: FavoritesService) { }

    @UseGuards(AuthGuard("jwt"))
    @Post("favorite/:productId")
    async addFavorite(@Req() req, @Param("productId") productId: number) {
        return this.favoritesService.addFavorite(req.user.id, productId);
    }

    @UseGuards(AuthGuard("jwt"))
    @Delete("favorite/:productId")
    async removeFavorite(@Req() req, @Param("productId") productId: number) {
        return this.favoritesService.removeFavorite(req.user.id, productId);
    }
}
