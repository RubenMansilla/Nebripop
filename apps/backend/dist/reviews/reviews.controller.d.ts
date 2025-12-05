import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    getReviewsForUser(userId: number, sortOption: string): Promise<import("./review.entity").Review[]>;
}
