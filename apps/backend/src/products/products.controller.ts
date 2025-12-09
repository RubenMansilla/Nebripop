import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    UseInterceptors,
    UploadedFiles,
    UseGuards,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./create-products.dto";

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

    @UseGuards(JwtAuthGuard)
    @Get('my-products/sold')
    async getMySoldProducts(@Req() req) {
        const userId = req.user.id;
        return this.productsService.getSoldProductsByUser(userId);
    }

}
