import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FavoritesService } from "./favorites.service";
import { FavoritesController } from "./favorites.controller";

import { FavoriteProduct } from "./favorite-product.entity";
import { FavoriteUser } from "./favorite-user.entity";
import { FavoriteAuction } from "./favorite-auction.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FavoriteProduct,
      FavoriteUser,
      FavoriteAuction,
    ]),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule { }
