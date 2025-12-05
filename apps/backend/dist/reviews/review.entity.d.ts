import { User } from '../users/users.entity';
import { Product } from '../products/products.entity';
export declare class Review {
    id: number;
    rating: number;
    comment: string;
    created_at: Date;
    reviewer_id: number;
    reviewed_user_id: number;
    product_id: number;
    reviewer: User;
    product: Product;
}
