import { Controller, Get, Param, } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Query } from '@nestjs/common/decorators';

@Controller('reviews')
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) { }

    @Get('user/:id')
    getReviewsForUser(
        @Param('id') userId: number,
        @Query('sort') sortOption: string
    ) {
        return this.reviewsService.getReviewsForUser(userId, sortOption);
    }

}