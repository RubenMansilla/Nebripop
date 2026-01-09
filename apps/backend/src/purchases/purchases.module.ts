// apps/backend/src/purchases/purchases.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Purchase } from "./purchase.entity";
import { PurchasesController } from "./purchases.controller";
import { PurchasesService } from "./purchases.service";
import { Product } from "../products/products.entity";
import { WalletModule } from "../wallet/wallet.module";
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, Product]),
    WalletModule,
    NotificationsModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule { }
