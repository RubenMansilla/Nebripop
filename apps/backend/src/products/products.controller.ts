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
    Param,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./create-products.dto";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt.guard";
import { Query, Ip } from "@nestjs/common";


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

    @UseGuards(OptionalJwtAuthGuard)
    @Get()
    getAllProducts(
        @Req() req,
        @Query("categoryId") categoryId?: number,
        @Query("subcategoryId") subcategoryId?: number,
        @Query("minPrice") minPrice?: number,
        @Query("maxPrice") maxPrice?: number,
        @Query("dateFilter") dateFilter?: "today" | "7days" | "30days"
    ) {
        const userId = req.user?.id || null;

        return this.productsService.getAllProducts(
            userId,
            categoryId,
            subcategoryId,
            minPrice,
            maxPrice,
            dateFilter
        );
    }

    // PERFIL PÚBLICO – PRODUCTOS DE UN USUARIO
    @UseGuards(OptionalJwtAuthGuard)
    @Get('public/user/:userId')
    async getPublicProductsByUser(
        @Param('userId', ParseIntPipe) sellerId: number,
        @Req() req
    ) {

        const viewerId = req.user?.id || null;

        return this.productsService.getPublicProductsByUser(sellerId, viewerId);
    }

    // Eliminar un producto
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteProduct(
        @Param('id', ParseIntPipe) productId: number,
        @Req() req
    ) {
        return this.productsService.deleteProduct(productId, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('top-success')
    getTopProducts(@Req() req) {
        return this.productsService.getTopSuccessfulProducts(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':productId')
    async getProductById(@Param('productId') productId: string, @Req() req) {
        const userId = req.user?.id || null;
        const productIdNumber = parseInt(productId, 10);
        return this.productsService.getProductById(productIdNumber, userId);
    }

    // Mis productos COMPRADOS (Historial)
    @UseGuards(JwtAuthGuard)
    @Get('my-products/purchased')
    async getMyPurchasedProducts(@Req() req) {
        return this.productsService.getPurchasedProductsByUser(req.user.id);
    }

    // En proceso de COMPRA
    @UseGuards(JwtAuthGuard)
    @Get('my-products/buying-process')
    async getBuyingProcess(@Req() req) {
        return this.productsService.getBuyingProcessProducts(req.user.id);
    }

    // En proceso de VENTA
    @UseGuards(JwtAuthGuard)
    @Get('my-products/selling-process')
    async getSellingProcess(@Req() req) {
        return this.productsService.getSellingProcessProducts(req.user.id);
    }

    // Incrementar vistas de un producto
    @UseGuards(OptionalJwtAuthGuard)
    @Post(':id/view')
    async incrementView(
        @Param('id', ParseIntPipe) productId: number,
        @Req() req,
        @Ip() ip: string // <--- NestJS nos da la IP aquí
    ) {
        // Si el usuario está logueado, req.user existirá (depende de tu Guard)
        const userId = req.user?.id || null;

        return this.productsService.incrementViews(productId, userId, ip);
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats/financial')
    async getFinancialStats(
        @Req() req,
        @Query('range') range: 'week' | 'month' | 'year' = 'year' // Por defecto año
    ) {
        return this.productsService.getFinancialStats(req.user.id, range);
    }

}