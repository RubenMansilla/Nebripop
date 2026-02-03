import { IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateAuctionDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    startingPrice: number;

    @IsNotEmpty()
    @IsNumber()
    durationHours: number; // Assuming we receive duration, simpler to calculate end_time in service
}
