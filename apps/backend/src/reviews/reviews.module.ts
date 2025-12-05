import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Product } from '../products/products.entity';
import { User } from '../users/users.entity';
import { ProductImage } from '../products/products-image.entity';

import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Review, Product, ProductImage, User]),
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService],
})
export class ReviewsModule { }