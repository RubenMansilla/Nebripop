import {
    Controller,
    Delete,
    Req,
    UseGuards,
    Param,
    ParseIntPipe,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PurchasesService } from "./purchases.service";

@Controller("purchases")
export class PurchasesController {
    constructor(private readonly purchasesService: PurchasesService) { }

    // Ocultar de "Mis Compras" (Tú eres el comprador)
    @UseGuards(JwtAuthGuard)
    @Delete('buy/:id')
    async hidePurchase(
        @Param('id', ParseIntPipe) id: number, // ParseIntPipe convierte el string a numero
        @Req() req
    ) {
        return this.purchasesService.hidePurchase(id, req.user.id);
    }

    // Ocultar de "Mis Ventas" (Tú eres el vendedor)
    @UseGuards(JwtAuthGuard)
    @Delete('sell/:id')
    async hideSale(
        @Param('id', ParseIntPipe) id: number,
        @Req() req
    ) {
        return this.purchasesService.hideSale(id, req.user.id);
    }
}