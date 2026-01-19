import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateReviewDto {
    @IsNotEmpty()
    @IsNumber()
    owner_id: number;

    @IsNotEmpty()
    @IsNumber()
    product_id: number;

    @IsNotEmpty()
    @IsNumber()
    rating: number;

    @IsNotEmpty()
    @IsString()
    comment: string;

    @IsOptional()
    @IsNumber()
    reviewer_id?: number;
}