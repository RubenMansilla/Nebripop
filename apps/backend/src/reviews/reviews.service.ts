import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewRepo: Repository<Review>,
    ) { }

    async getReviewsForUser(userId: number, sortOption: string) {
        let order: any = {};

        switch (sortOption) {
            case 'newest':
                order = { created_at: 'DESC' };
                break;
            case 'oldest':
                order = { created_at: 'ASC' };
                break;
            case 'low-rating':
                order = { rating: 'ASC' };
                break;
            case 'high-rating':
                order = { rating: 'DESC' };
                break;
            default:
                order = { created_at: 'DESC' };
        }

        return await this.reviewRepo.find({
            where: { reviewed_user_id: userId },
            relations: ['reviewer', 'product', 'product.images'],
            order,
        });
    }

    async getUserRatingSummary(userId: number) {
        const reviews = await this.reviewRepo.find({
            where: { reviewed_user_id: userId },
            select: ['rating']
        });

        if (reviews.length === 0) {
            return { average: 0, total: 0 };
        }

        const total = reviews.length;
        const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
        const average = sum / total;

        return { average, total };
    }

    async createReview(createReviewDto: CreateReviewDto, reviewerIdFromToken: number) {
        const newReview = this.reviewRepo.create({
            rating: createReviewDto.rating,
            comment: createReviewDto.comment,
            reviewed_user_id: createReviewDto.owner_id,
            product_id: createReviewDto.product_id,
            reviewer_id: reviewerIdFromToken,
            created_at: new Date(),
        });

        return await this.reviewRepo.save(newReview);
    }
}
