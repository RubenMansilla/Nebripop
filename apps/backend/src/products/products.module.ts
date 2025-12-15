import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./products.entity";
import { ProductImage } from "./products-image.entity";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { FavoriteProduct } from "../favorites/favorite-product.entity";
import { Chat } from "../chat/chat.entity";
import { Purchase } from "../purchases/purchase.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, FavoriteProduct, Chat, Purchase])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule { }
