// apps/backend/src/purchases/purchases.controller.ts
import {
  Controller,
  Delete,
  Get,
  Query,
  BadRequestException,
  Req,
  UseGuards,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PurchasesService } from "./purchases.service";

@Controller("purchases")
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  // Crear una compra
  @UseGuards(JwtAuthGuard)
  @Post()
  async createPurchase(@Req() req, @Body() body: any) {
    if (!body.productId) {
      throw new BadRequestException("productId es obligatorio");
    }
    return this.purchasesService.createPurchase(body, req.user.id);
  }

  // Ocultar de "Mis Compras" (Tú eres el comprador)
  @UseGuards(JwtAuthGuard)
  @Delete("buy/:id")
  async hidePurchase(
    @Param("id", ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.purchasesService.hidePurchase(id, req.user.id);
  }

  // Ocultar de "Mis Ventas" (Tú eres el vendedor)
  @UseGuards(JwtAuthGuard)
  @Delete("sell/:id")
  async hideSale(
    @Param("id", ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.purchasesService.hideSale(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("history")
  async getMyTransactions(@Req() req, @Query("type") type: string = "all") {
    if (!["all", "in", "out"].includes(type)) {
      throw new BadRequestException("Invalid filter type");
    }
    return this.purchasesService.findAllUserTransactions(
      req.user.id,
      type as any,
    );
  }
}
