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

                        // CLEANUP: Eliminar notificaciones previas de "quedan X tiempo" para no acumularlas
                        await this.notificationsService.deleteByTypeAndProduct(
                            bidderId,
                            'auction_alert',
                            auction.product.id
                        );

                        await this.notificationsService.create(
                            bidderId,
                            `Subasta "${auction.product.name}": quedan ${t.label}`,
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
                    `Subasta "${auction.product.name}" finalizada sin pujas.`,
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
                deadline.setMinutes(deadline.getMinutes() + 1);
                // deadline.setHours(deadline.getHours() + 48);
                auction.payment_deadline = deadline;

                // NOTIFY WINNER
                await this.notificationsService.create(
                    highestBid.bidder.id,
                    `¡Ganaste "${auction.product.name}"! Paga en 48h.`,
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
                        `Pago "${auction.product.name}": quedan ${t.label}.`,
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

            // 2. Track failed payment to prevent loops
            auction.notifications_sent = auction.notifications_sent || {};
            auction.notifications_sent[`failed_payment_${currentWinner.id}`] = true;

            // CLEANUP: Eliminar la notificación de "Has ganado" para que no se contradiga con la de penalización
            await this.notificationsService.deleteByTypeAndProduct(
                currentWinner.id,
                'auction_win',
                auction.product.id
            );

            // NOTIFY PENALTY
            await this.notificationsService.create(
                currentWinner.id,
                `Pago vencido: "${auction.product.name}". Penalización aplicada.`,
                'penalty_alert',
                auction.product.id
            );

            // 3. Reassign to next highest bidder (excluding penalized ones for this auction)

            // Logic: Filter out this specific User AND any previous failures for this auction
            const validBids = auction.bids.filter(bid =>
                Number(bid.bidder_id) !== Number(currentWinner.id) &&
                !auction.notifications_sent[`failed_payment_${bid.bidder_id}`]
            );

            if (validBids.length === 0) {
                // No backup -> Expired
                auction.status = 'expired';
                auction.winner = null;
                auction.payment_deadline = null;

                // NOTIFY SELLER
                await this.notificationsService.create(
                    auction.seller_id,
                    `Sin pago para "${auction.product.name}". Subasta cancelada.`,
                    'auction_failed',
                    auction.product.id
                );
            } else {
                // Sort descending
                validBids.sort((a, b) => Number(b.amount) - Number(a.amount));

                const nextHighestBid = validBids[0];

                auction.winner = nextHighestBid.bidder;
                auction.current_bid = nextHighestBid.amount;

                // Reset deadline (48h)
                const deadline = new Date();
                // deadline.setHours(deadline.getHours() + 48);
                deadline.setMinutes(deadline.getMinutes() + 1);
                auction.payment_deadline = deadline;

                // We DO NOT reset notifications_sent completely because we need to keep the failed_payment flags!
                // We only need to reset the payment reminders.
                // Let's iterate and remove only keys starting with 'pay_'
                Object.keys(auction.notifications_sent).forEach(key => {
                    if (key.startsWith('pay_')) {
                        delete auction.notifications_sent[key];
                    }
                });

                this.logger.log(`Auction ${auction.id} reassigned to ${nextHighestBid.bidder.id}.`);

                // NOTIFY NEW WINNER
                await this.notificationsService.create(
                    nextHighestBid.bidder.id,
                    `¡Eres el nuevo ganador de "${auction.product.name}"! Paga en 48h.`,
                    'auction_win',
                    auction.product.id
                );
            }

            await this.auctionsRepository.save(auction);
        }
    }
}
