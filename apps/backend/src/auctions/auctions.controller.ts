import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    Delete,
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auctions')
export class AuctionsController {
    constructor(private readonly auctionsService: AuctionsService) { }

    @Get()
    findAll() {
        return this.auctionsService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-auctions')
    findMyAuctions(@Request() req) {
        // req.user should be populated by AuthGuard
        return this.auctionsService.findByUser(req.user.sub ?? req.user.id);
    }



    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createAuctionDto: CreateAuctionDto, @Request() req) {
        return this.auctionsService.create(createAuctionDto, req.user.sub ?? req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-history')
    findMyHistory(@Request() req) {
        return this.auctionsService.findHistoryByUser(req.user.sub ?? req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('participating')
    findParticipating(@Request() req) {
        return this.auctionsService.findParticipatingByUser(req.user.sub ?? req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.auctionsService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/bid')
    placeBid(@Param('id') id: string, @Body() placeBidDto: PlaceBidDto, @Request() req) {
        return this.auctionsService.placeBid(+id, placeBidDto.amount, req.user.sub ?? req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.auctionsService.remove(+id, req.user.sub ?? req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/pay')
    pay(@Param('id') id: string, @Body() shippingData: any, @Request() req) {
        return this.auctionsService.processPayment(+id, req.user.sub ?? req.user.id, shippingData);
    }
}
