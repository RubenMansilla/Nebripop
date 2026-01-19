import { Controller, Get, Param, Query, Post, Body, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

    @Get('user/:id/summary')
    getUserRatingSummary(@Param('id') userId: number) {
        return this.reviewsService.getUserRatingSummary(userId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createReview(@Body() createReviewDto: CreateReviewDto, @Req() req) {

        const reviewerId = req.user.id;

        return this.reviewsService.createReview(createReviewDto, reviewerId);
    }
}
