import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./products.entity";
import { ProductImage } from "./products-image.entity";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { FavoriteProduct } from "../favorites/favorite-product.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, FavoriteProduct])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule { }
