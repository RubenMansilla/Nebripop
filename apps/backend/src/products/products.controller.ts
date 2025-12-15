import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Req,
    UseInterceptors,
    UploadedFiles,
    ParseIntPipe,
    UseGuards,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./create-products.dto";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt.guard";
import { Param } from '@nestjs/common';

@Controller("products")
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FilesInterceptor("images", 6))
    create(
        @Body() dto: CreateProductDto,
        @UploadedFiles() images: Express.Multer.File[],
        @Req() req: any
    ) {
        return this.productsService.createProduct(dto, images, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-products/active')
    async getMyActiveProducts(@Req() req) {
        const userId = req.user.id;
        return this.productsService.getActiveProductsByUser(userId);
    }

    // Mis productos VENDIDOS (Historial)
    @UseGuards(JwtAuthGuard)
    @Get('my-products/sold')
    async getMySoldProducts(@Req() req) {
        const userId = req.user.id;
        return this.productsService.getSoldProductsByUser(userId);
    }
    // Obtener todos los productos (sin necesidad de login)
    @UseGuards(OptionalJwtAuthGuard)
    @Get()
    getAllProducts(@Req() req) {
        const userId = req.user?.id || null;
        return this.productsService.getAllProducts(userId);
    }

    // Eliminar un producto
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteProduct(
        @Param('id', ParseIntPipe) productId: number, // Valida que sea número
        @Req() req // Necesario para saber QUIÉN borra
    ) {
        // Pasamos ambos IDs al servicio
        return this.productsService.deleteProduct(productId, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':productId')
    async getProductById(@Param('productId') productId: string, @Req() req) {
        const userId = req.user?.id || null;
        const productIdNumber = parseInt(productId, 10); // Convert productId to number
        return this.productsService.getProductById(productIdNumber, userId);
    }

    // Mis productos COMPRADOS (Historial)
    @UseGuards(JwtAuthGuard)
    @Get('my-products/purchased')
    async getMyPurchasedProducts(@Req() req) {
        return this.productsService.getPurchasedProductsByUser(req.user.id);
    }

    // En proceso de COMPRA (Estoy negociando)
    @UseGuards(JwtAuthGuard)
    @Get('my-products/buying-process')
    async getBuyingProcess(@Req() req) {
        return this.productsService.getBuyingProcessProducts(req.user.id);
    }

    // En proceso de VENTA (Me están negociando)
    @UseGuards(JwtAuthGuard)
    @Get('my-products/selling-process')
    async getSellingProcess(@Req() req) {
        return this.productsService.getSellingProcessProducts(req.user.id);
    }

}
