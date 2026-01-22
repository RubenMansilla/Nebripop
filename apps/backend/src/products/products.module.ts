import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./products.entity";
import { ProductImage } from "./products-image.entity";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { FavoriteProduct } from "../favorites/favorite-product.entity";
import { Chat } from "../chat/chat.entity";
import { Purchase } from "../purchases/purchase.entity";
import { Review } from "../reviews/review.entity";
import { User } from "../users/users.entity";
import { ProductView } from "./ProductView/product-view.entity";
import { NotificationsService } from "../notifications/notifications.service";
import { Notification } from "../notifications/notification.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, FavoriteProduct, Chat, Purchase, Review, User, ProductView, Notification])],
  controllers: [ProductsController],
  providers: [ProductsService, NotificationsService],
})
export class ProductsModule { }
