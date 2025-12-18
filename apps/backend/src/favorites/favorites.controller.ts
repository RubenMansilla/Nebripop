import { Controller, Post, Delete, Get, Param, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FavoritesService } from "./favorites.service";

@Controller("favorites")
export class FavoritesController {

  constructor(private favoritesService: FavoritesService) {}

  /* ========= PRODUCTOS ========= */

  @UseGuards(AuthGuard("jwt"))
  @Post("favorite/:productId")
  addFavorite(@Req() req, @Param("productId") productId: number) {
    return this.favoritesService.addFavorite(req.user.id, productId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete("favorite/:productId")
  removeFavorite(@Req() req, @Param("productId") productId: number) {
    return this.favoritesService.removeFavorite(req.user.id, productId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("products")
  getFavoriteProducts(@Req() req) {
    return this.favoritesService.getFavoriteProducts(req.user.id);
  }

  /* ========= USUARIOS ========= */

  @UseGuards(AuthGuard("jwt"))
  @Post("users/:userId")
  addFavoriteUser(@Req() req, @Param("userId") userId: number) {
    return this.favoritesService.addFavoriteUser(req.user.id, userId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete("users/:userId")
  removeFavoriteUser(@Req() req, @Param("userId") userId: number) {
    return this.favoritesService.removeFavoriteUser(req.user.id, userId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("users")
  getFavoriteUsers(@Req() req) {
    return this.favoritesService.getFavoriteUsers(req.user.id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("users/:userId/is-favorite")
  isFavoriteUser(@Req() req, @Param("userId") userId: number) {
    return this.favoritesService.isFavoriteUser(req.user.id, userId);
  }
}
