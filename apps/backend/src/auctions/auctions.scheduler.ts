import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThan, Not, In, Between, MoreThan } from 'typeorm';
import { Auction } from './entities/auction.entity';
import { User } from '../users/users.entity';
import { Bid } from './entities/bid.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuctionsScheduler {
    private readonly logger = new Logger(AuctionsScheduler.name);

    constructor(
        @InjectRepository(Auction)
        private auctionsRepository: Repository<Auction>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Bid)
        private bidsRepository: Repository<Bid>,
        private notificationsService: NotificationsService,
    ) { }

    // ======================================
    // 1. COUNTDOWN NOTIFICATIONS (Active)
    // ======================================
    @Cron(CronExpression.EVERY_MINUTE)
    async handleAuctionCountdowns() {
        const activeAuctions = await this.auctionsRepository.find({
            where: { status: 'active' },
            relations: ['bids', 'bids.bidder', 'product'],
        });

        const thresholds = [
            { minutes: 300, key: 'end_5h', label: '5 horas' },
            { minutes: 60, key: 'end_1h', label: '1 hora' },
            { minutes: 30, key: 'end_30min', label: '30 minutos' },
            { minutes: 10, key: 'end_10min', label: '10 minutos' },
            { minutes: 5, key: 'end_5min', label: '5 minutos' },
        ];

        for (const auction of activeAuctions) {
            const timeLeftMs = auction.end_time.getTime() - new Date().getTime();
            const timeLeftMinutes = Math.floor(timeLeftMs / 60000);

            if (timeLeftMinutes <= 0) continue; // Handled by handleFinishedAuctions

            auction.notifications_sent = auction.notifications_sent || {};

            for (const t of thresholds) {
                // Trigger if within range (e.g. between 299 and 300 mins for 5h alert)
                // Using a small window to avoid repeated handling if job skips a beat, but flag prevents duplication.
                if (timeLeftMinutes <= t.minutes && !auction.notifications_sent[t.key]) {

                    // Notify all unique bidders
                    const uniqueBidders = new Set(auction.bids.map(b => b.bidder.id));

                    for (const bidderId of uniqueBidders) {
                        await this.notificationsService.create(
                            bidderId,
                            `⏳ Atención: Quedan ${t.label} para que finalice la subasta de "${auction.product.name}"`,
                            'auction_alert',
                            auction.product.id
                        );
                    }

                    auction.notifications_sent[t.key] = true;
                    await this.auctionsRepository.save(auction);
                }
            }
        }
    }

    // ======================================
    // 2. FINISHED AUCTIONS (Win/Expire)
    // ======================================
    @Cron(CronExpression.EVERY_MINUTE)
    async handleFinishedAuctions() {
        // Find ACTIVE auctions that have ended
        const expiredAuctions = await this.auctionsRepository.find({
            where: {
                status: 'active',
                end_time: LessThan(new Date()),
            },
            relations: ['bids', 'bids.bidder', 'product', 'seller'],
        });

        for (const auction of expiredAuctions) {
            this.logger.log(`Processing finished auction ${auction.id}`);

            if (!auction.bids || auction.bids.length === 0) {
                // No bids -> Expired
                auction.status = 'expired';
                this.logger.log(`Auction ${auction.id} expired with no bids`);
                this.notificationsService.create(
                    auction.seller_id,
                    `Tu subasta para "${auction.product.name}" ha finalizado sin pujas.`,
                    'auction_end',
                    auction.product.id
                );
            } else {
                // Determine highest bidder
                const highestBid = auction.bids.reduce((prev, current) =>
                    (Number(prev.amount) > Number(current.amount)) ? prev : current
                );

                auction.status = 'awaiting_payment';
                auction.winner = highestBid.bidder;
                auction.current_bid = highestBid.amount;

                // Set deadline (48 hours)
                const deadline = new Date();
                deadline.setHours(deadline.getHours() + 48);
                auction.payment_deadline = deadline;

                // NOTIFY WINNER
                await this.notificationsService.create(
                    highestBid.bidder.id,
                    `🎉 ¡Has ganado la subasta de "${auction.product.name}"! Tienes 48h para realizar el pago.`,
                    'auction_win',
                    auction.product.id
                );

                // Initialize notifications tracking for payment
                auction.notifications_sent = auction.notifications_sent || {};

                this.logger.log(`Auction ${auction.id} won by user ${highestBid.bidder.id}. Waiting payment.`);
            }

            await this.auctionsRepository.save(auction);
        }
    }

    // ======================================
    // 3. PAYMENT REMINDERS (Awaiting Payment)
    // ======================================
    @Cron(CronExpression.EVERY_MINUTE)
    async handlePaymentReminders() {
        const pendingAuctions = await this.auctionsRepository.find({
            where: { status: 'awaiting_payment' },
            relations: ['winner', 'product'],
        });

        const thresholds = [
            { hours: 24, key: 'pay_24h', label: '24 horas' },
            { hours: 5, key: 'pay_5h', label: '5 horas' },
            { hours: 1, key: 'pay_1h', label: '1 hora' },
            { minutes: 30, key: 'pay_30min', label: '30 minutos' },
            { minutes: 5, key: 'pay_5min', label: '5 minutos' },
        ];

        for (const auction of pendingAuctions) {
            if (!auction.payment_deadline || !auction.winner) continue;

            const timeLeftMs = auction.payment_deadline.getTime() - new Date().getTime();
            const timeLeftMinutes = Math.floor(timeLeftMs / 60000);
            const timeLeftHours = timeLeftMinutes / 60;

            if (timeLeftMinutes <= 0) continue; // Handled by handlePaymentDeadlines

            auction.notifications_sent = auction.notifications_sent || {};

            for (const t of thresholds) {
                let shouldNotify = false;

                if (t.hours) {
                    // Check hours match with wiggle room
                    if (timeLeftHours <= t.hours && !auction.notifications_sent[t.key]) {
                        shouldNotify = true;
                    }
                } else if (t.minutes) {
                    if (timeLeftMinutes <= t.minutes && !auction.notifications_sent[t.key]) {
                        shouldNotify = true;
                    }
                }

                if (shouldNotify) {
                    await this.notificationsService.create(
                        auction.winner.id,
                        `⚠️ Recordatorio: Te quedan ${t.label} para pagar "${auction.product.name}".`,
                        'payment_reminder',
                        auction.product.id
                    );

                    auction.notifications_sent[t.key] = true;
                    await this.auctionsRepository.save(auction);
                }
            }
        }
    }

    // ======================================
    // 4. PENALTIES & REASSIGNMENT
    // ======================================
    @Cron(CronExpression.EVERY_MINUTE)
    async handlePaymentDeadlines() {
        const unpaidAuctions = await this.auctionsRepository.find({
            where: {
                status: 'awaiting_payment',
                payment_deadline: LessThan(new Date()),
            },
            relations: ['winner', 'bids', 'bids.bidder', 'product', 'seller'],
        });

        for (const auction of unpaidAuctions) {
            const currentWinner = auction.winner;
            if (!currentWinner) continue;

            this.logger.log(`Auction ${auction.id}: Winner ${currentWinner.id} failed to pay. Penalizing.`);

            // 1. Penalize
            currentWinner.penaltiesCount = (currentWinner.penaltiesCount || 0) + 1;
            await this.usersRepository.save(currentWinner);

            // NOTIFY PENALTY
            await this.notificationsService.create(
                currentWinner.id,
                `❌ No has pagado a tiempo el artículo "${auction.product.name}". Has recibido una penalización.`,
                'penalty_alert',
                auction.product.id
            );

            // 2. Reassign to next highest bidder (excluding penalized ones)
            // Note: In a real system, we might need a list of 'failed_winners' to exclude all
            // For now, filter out current winner.

            // Logic: Filter out this specific User from bids
            const validBids = auction.bids.filter(bid => Number(bid.bidder_id) !== Number(currentWinner.id));

            // Filter out ANY previous winner if we track them (simple approach: assumed only 1 reassignment here or loop logic needed)
            // But simplified: 

            if (validBids.length === 0) {
                // No backup -> Expired
                auction.status = 'expired';
                auction.winner = null;
                auction.payment_deadline = null;

                // NOTIFY SELLER
                await this.notificationsService.create(
                    auction.seller_id,
                    `😞 Lamentablemente, ningún usuario completó el pago para "${auction.product.name}". La subasta ha sido cancelada.`,
                    'auction_failed',
                    auction.product.id
                );
            } else {
                // Sort descending
                validBids.sort((a, b) => Number(b.amount) - Number(a.amount));

                // We need to find the next highest bidder who HAS NOT already been penalized for THIS auction...
                // Ideally, we'd store 'failed_winner_ids' on the auction.
                // For this iteration, we just accept the next one.

                const nextHighestBid = validBids[0];

                auction.winner = nextHighestBid.bidder;
                auction.current_bid = nextHighestBid.amount;

                // Reset deadline (48h)
                const deadline = new Date();
                deadline.setHours(deadline.getHours() + 48);
                auction.payment_deadline = deadline;

                // Reset notification flags for payment reminders
                auction.notifications_sent = {};

                this.logger.log(`Auction ${auction.id} reassigned to ${nextHighestBid.bidder.id}.`);

                // NOTIFY NEW WINNER
                await this.notificationsService.create(
                    nextHighestBid.bidder.id,
                    `🎉 ¡Buenas noticias! El ganador anterior falló el pago. Ahora eres el ganador de "${auction.product.name}". Tienes 48h para pagar.`,
                    'auction_win',
                    auction.product.id
                );
            }

            await this.auctionsRepository.save(auction);
        }
    }
}
