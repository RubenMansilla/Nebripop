import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { Product } from '../products/products.entity';
import { User } from '../users/users.entity';
import { PurchasesService } from '../purchases/purchases.service';
import { FavoriteAuction } from '../favorites/favorite-auction.entity';

@Injectable()
export class AuctionsService {
    constructor(
        @InjectRepository(Auction)
        private auctionsRepository: Repository<Auction>,
        @InjectRepository(Bid)
        private bidsRepository: Repository<Bid>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(FavoriteAuction)
        private favoritesAuctionRepository: Repository<FavoriteAuction>,
        private purchasesService: PurchasesService,
    ) { }

    async create(createAuctionDto: CreateAuctionDto, userId: number) {
        const { productId, startingPrice, durationHours } = createAuctionDto;

        // Check product ownership and availability
        const product = await this.productsRepository.findOne({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException('Producto no encontrado');
        }

        if (Number(product.owner_id) !== Number(userId)) {
            throw new BadRequestException('No eres el dueño de este producto');
        }

        // Check if already in active auction
        const existingAuction = await this.auctionsRepository.findOne({
            where: { product_id: productId, status: 'active' },
        });

        if (existingAuction) {
            throw new BadRequestException('El producto ya está en una subasta activa');
        }

        // Calculate end time
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + durationHours);

        const auction = this.auctionsRepository.create({
            product_id: productId,
            seller_id: userId,
            starting_price: startingPrice,
            current_bid: startingPrice,
            end_time: endTime,
            status: 'active',
        });

        return await this.auctionsRepository.save(auction);
    }

    async findAll(userId?: number) {
        const auctions = await this.auctionsRepository.find({
            where: { status: 'active' },
            relations: ['product', 'product.images', 'seller'], // Include images for listing
            order: { created_at: 'DESC' },
        });

        if (userId) {
            const favorites = await this.favoritesAuctionRepository.find({
                where: { user_id: userId }
            });
            const favoriteIds = favorites.map(f => f.auction_id);
            return auctions.map(a => ({
                ...a,
                isFavorite: favoriteIds.includes(a.id)
            }));
        }

        return auctions;
    }

    async findOne(id: number) {
        const auction = await this.auctionsRepository.findOne({
            where: { id },
            relations: [
                'product',
                'product.images',
                'product.seller', // For product details
                'bids',
                'bids.bidder', // For bid history
                'seller' // For auction owner info
            ],
            order: {
                bids: {
                    created_at: 'DESC', // Latest bids first
                },
            },
        });

        if (!auction) {
            throw new NotFoundException('Subasta no encontrada');
        }

        return auction;
    }

    async placeBid(auctionId: number, amount: number, userId: number) {
        const auction = await this.auctionsRepository.findOne({ where: { id: auctionId } });
        if (!auction) {
            throw new NotFoundException('Subasta no encontrada');
        }

        if (auction.status !== 'active') {
            throw new BadRequestException('La subasta no está activa');
        }

        if (new Date() > auction.end_time) {
            auction.status = 'completed';
            await this.auctionsRepository.save(auction);
            throw new BadRequestException('La subasta ha finalizado');
        }

        if (Number(amount) <= Number(auction.current_bid)) {
            throw new BadRequestException(`La puja debe ser mayor a ${auction.current_bid}`);
        }

        // Prevent self-bidding?
        if (Number(auction.seller_id) === Number(userId)) {
            throw new BadRequestException('No puedes pujar en tu propia subasta');
        }

        const bid = this.bidsRepository.create({
            auction_id: auctionId,
            bidder_id: userId,
            amount: amount,
        });

        await this.bidsRepository.save(bid);

        // Update auction current bid
        auction.current_bid = amount;
        await this.auctionsRepository.save(auction);

        return auction;
    }

    async findByUser(userId: number) {
        return await this.auctionsRepository.find({
            where: { seller_id: userId, status: 'active' },
            relations: ['product', 'product.images'],
            order: { created_at: 'DESC' },
        });
    }

    async findParticipatingByUser(userId: number) {
        return await this.auctionsRepository.createQueryBuilder('auction')
            .leftJoinAndSelect('auction.product', 'product')
            .leftJoinAndSelect('product.images', 'images')
            .innerJoin('auction.bids', 'bid')
            .where('bid.bidder_id = :userId', { userId })
            .andWhere('auction.status IN (:...statuses)', { statuses: ['active', 'awaiting_payment', 'sold'] })
            .orderBy('auction.created_at', 'DESC')
            .getMany();
    }

    async findHistoryByUser(userId: number) {
        return await this.auctionsRepository.find({
            where: [
                { seller_id: userId, status: 'completed' },
                { seller_id: userId, status: 'cancelled' },
                { seller_id: userId, status: 'sold' },
                { seller_id: userId, status: 'expired' },
            ],
            relations: ['product', 'product.images'],
            order: { created_at: 'DESC' },
        });
    }

    async remove(id: number, userId: number) {
        const auction = await this.auctionsRepository.findOne({
            where: { id },
            relations: ['bids'] // Check for bids
        });

        if (!auction) {
            throw new NotFoundException('Subasta no encontrada');
        }

        if (Number(auction.seller_id) !== Number(userId)) {
            throw new BadRequestException('No tienes permiso para eliminar esta subasta');
        }

        if (auction.bids && auction.bids.length > 0) {
            throw new BadRequestException('No puedes eliminar una subasta con pujas activas. Debes esperar a que finalice.');
        }

        return await this.auctionsRepository.remove(auction);
    }

    async processPayment(auctionId: number, userId: number, shippingData: any = {}) {
        const auction = await this.auctionsRepository.findOne({ where: { id: auctionId } });
        if (!auction) {
            throw new NotFoundException('Subasta no encontrada');
        }

        if (auction.status !== 'awaiting_payment') {
            throw new BadRequestException('La subasta no está pendiente de pago');
        }

        if (Number(auction.winner_id) !== Number(userId)) {
            throw new BadRequestException('Solo el ganador puede pagar esta subasta');
        }

        // Prepare info for Purchase creation
        const purchasePayload = {
            productId: auction.product_id,
            agreedPrice: auction.current_bid,
            ...shippingData
        };

        // Create Purchase (handles wallet, product sold status, etc.)
        await this.purchasesService.createPurchase(purchasePayload, userId);

        // Finalize Auction
        auction.status = 'sold';
        auction.payment_deadline = null; // Clear deadline

        return await this.auctionsRepository.save(auction);
    }
}
