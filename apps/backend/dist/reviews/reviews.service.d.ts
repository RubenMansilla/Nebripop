import { Repository } from 'typeorm';
import { Review } from './review.entity';
export declare class ReviewsService {
    private reviewRepo;
    constructor(reviewRepo: Repository<Review>);
    getReviewsForUser(userId: number, sortOption: string): Promise<Review[]>;
    getUserRatingSummary(userId: number): Promise<{
        average: number;
        total: number;
    }>;
}
