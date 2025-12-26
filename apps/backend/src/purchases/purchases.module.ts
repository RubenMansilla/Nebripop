import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Purchase } from "./purchase.entity";
import { PurchasesController } from "./purchases.controller";
import { PurchasesService } from "./purchases.service";

@Module({
    imports: [TypeOrmModule.forFeature([Purchase])],
    controllers: [PurchasesController],
    providers: [PurchasesService],
})
export class PurchasesModule { }