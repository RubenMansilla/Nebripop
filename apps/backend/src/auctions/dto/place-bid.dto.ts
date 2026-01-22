import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class PlaceBidDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0.01)
    amount: number;
}
