import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { AuctionsScheduler } from './auctions.scheduler';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { Product } from '../products/products.entity';
import { User } from '../users/users.entity';

import { PurchasesModule } from '../purchases/purchases.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { FavoriteAuction } from '../favorites/favorite-auction.entity';
import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module'; // ← NUEVO

@Module({
    imports: [
        TypeOrmModule.forFeature([Auction, Bid, Product, User, FavoriteAuction]),
        ScheduleModule.forRoot(),
        PurchasesModule,
        NotificationsModule,
        UsersModule,
        WalletModule, // ← NUEVO
    ],
    controllers: [AuctionsController],
    providers: [AuctionsService, AuctionsScheduler],
    exports: [AuctionsService],
})
export class AuctionsModule { }
