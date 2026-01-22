import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule'; // Import ScheduleModule
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { AuctionsScheduler } from './auctions.scheduler'; // Import Scheduler
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { Product } from '../products/products.entity';
import { User } from '../users/users.entity'; // Import User for Scheduler

import { PurchasesModule } from '../purchases/purchases.module'; // Import PurchasesModule
import { NotificationsModule } from '../notifications/notifications.module'; // Import NotificationsModule

@Module({
    imports: [
        TypeOrmModule.forFeature([Auction, Bid, Product, User]),
        ScheduleModule.forRoot(),
        PurchasesModule, // Add to imports
        NotificationsModule
    ],
    controllers: [AuctionsController],
    providers: [AuctionsService, AuctionsScheduler], // Add Scheduler
    exports: [AuctionsService],
})
export class AuctionsModule { }
