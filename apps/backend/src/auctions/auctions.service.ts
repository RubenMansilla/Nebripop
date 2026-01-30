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
        const existingActiveAuction = await this.auctionsRepository.findOne({
            where: { product_id: productId, status: 'active' },
        });

        if (existingActiveAuction) {
            throw new BadRequestException('El producto ya está en una subasta activa');
        }

        // Delete any previous expired/cancelled/completed auctions of the same product
        // to avoid duplicates in history
        const previousAuctions = await this.auctionsRepository.find({
            where: [
                { product_id: productId, seller_id: userId, status: 'expired' },
                { product_id: productId, seller_id: userId, status: 'cancelled' },
                { product_id: productId, seller_id: userId, status: 'completed' },
            ],
        });

        if (previousAuctions.length > 0) {
            await this.auctionsRepository.remove(previousAuctions);
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
        // Build query to get active auctions
        const queryBuilder = this.auctionsRepository
            .createQueryBuilder('auction')
            .leftJoinAndSelect('auction.product', 'product')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('auction.seller', 'seller')
            .where('auction.status = :status', { status: 'active' })
            .orderBy('auction.created_at', 'DESC');

        // If user is authenticated, exclude their own auctions
        if (userId) {
            queryBuilder.andWhere('auction.seller_id != :userId', { userId });
        }

        const auctions = await queryBuilder.getMany();

        // Add favorite status if user is authenticated
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
        const auctions = await this.auctionsRepository.createQueryBuilder('auction')
            .leftJoinAndSelect('auction.product', 'product')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect(
                'purchases',
                'purchase',
                'purchase.product_id = auction.product_id AND purchase.seller_id = :userId',
                { userId }
            )
            .where('auction.seller_id = :userId', { userId })
            .andWhere('auction.status IN (:...statuses)', {
                statuses: ['completed', 'cancelled', 'sold', 'expired']
            })
            .orderBy('auction.created_at', 'DESC')
            .addSelect([
                'purchase.id',
                'purchase.price',
                'purchase.purchasedAt',
                'purchase.buyerId'
            ])
            .getMany();

        // Map the purchase data into the auction object for easier frontend access
        return auctions.map(auction => {
            const purchase = (auction as any).purchase;
            return {
                ...auction,
                purchase: purchase || null
            };
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
